'use client';

import { MethodBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import {
  createEndpoint,
  getEndpoints,
  getLatestResults,
  getProject,
  getTestStats,
  runProjectTests,
  syncProjectApis,
  testEndpoint,
  updateProject,
} from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ApiEndpoint, AuthType, CreateEndpointRequest, CreateProjectRequest, HttpMethod, ParamSchema, TestEndpointRequest } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Link as LinkIcon, Lock, LockOpen, Play, Plus, RefreshCw, Settings, Trash2, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { t, language } = useLanguage();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
  const [swaggerUrls, setSwaggerUrls] = useState<string[]>(['']);
  const [endpointForm, setEndpointForm] = useState<CreateEndpointRequest>({
    path: '',
    method: 'GET',
    summary: '',
    description: '',
    sampleRequestBody: '',
    queryParams: '',
    headers: '',
    expectedStatusCode: 200,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testForm, setTestForm] = useState<{
    pathParams: Record<string, string>;
    pathParamsSchema: ParamSchema[];
    queryParams: Record<string, string>;
    queryParamsSchema: ParamSchema[];
    headersText: string;
    requestBody: string;
  }>({
    pathParams: {},
    pathParamsSchema: [],
    queryParams: {},
    queryParamsSchema: [],
    headersText: '',
    requestBody: '',
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState<{
    authType: AuthType;
    authValue: string;
    headerName: string;
  }>({
    authType: 'NONE',
    authValue: '',
    headerName: '',
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  });

  const { data: endpoints } = useQuery({
    queryKey: ['endpoints', id],
    queryFn: () => getEndpoints(id),
  });

  const { data: latestResults } = useQuery({
    queryKey: ['latestResults', id],
    queryFn: () => getLatestResults(id),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => getTestStats(id),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<CreateProjectRequest>) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => syncProjectApis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showSuccess(t('success.syncCompleted'));
      setShowSwaggerModal(false);
    },
    onError: (error) => {
      showError(error);
    },
  });

  const runAllMutation = useMutation({
    mutationFn: () => runProjectTests(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
      showSuccess(t('success.testsCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const testEndpointMutation = useMutation({
    mutationFn: ({ endpointId, request }: { endpointId: string; request?: TestEndpointRequest }) =>
      testEndpoint(id, endpointId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
      setShowTestModal(false);
      showSuccess(t('success.testCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const createEndpointMutation = useMutation({
    mutationFn: (data: CreateEndpointRequest) => createEndpoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showSuccess(t('success.endpointCreated'));
      setShowAddModal(false);
      setEndpointForm({
        path: '',
        method: 'GET',
        summary: '',
        description: '',
        sampleRequestBody: '',
        queryParams: '',
        headers: '',
        expectedStatusCode: 200,
      });
      setShowAdvanced(false);
    },
    onError: (error) => {
      showError(error);
    },
  });

  const getResultForEndpoint = (endpointId: string) => {
    return latestResults?.find((r) => r.endpointId === endpointId);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    createEndpointMutation.mutate(endpointForm);
  };

  // Extract path parameters from endpoint path (e.g., /users/{userId}/posts/{postId})
  const extractPathParams = (path: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const params: string[] = [];
    let match;
    while ((match = regex.exec(path)) !== null) {
      params.push(match[1]);
    }
    return params;
  };

  // Parse schema JSON safely
  const parseSchemaJson = (json: string | undefined): ParamSchema[] => {
    if (!json) return [];
    try {
      return JSON.parse(json) as ParamSchema[];
    } catch {
      return [];
    }
  };

  // Generate default value based on schema type
  const getDefaultValue = (schema: ParamSchema): string => {
    const type = schema.schema?.type;
    const example = schema.schema?.example;
    const defaultVal = schema.schema?.default;
    const enumVals = schema.schema?.enum;

    if (example !== undefined) return String(example);
    if (defaultVal !== undefined) return String(defaultVal);
    if (enumVals && enumVals.length > 0) return enumVals[0];

    switch (type) {
      case 'integer':
      case 'number':
        return '1';
      case 'boolean':
        return 'true';
      case 'array':
        return '[]';
      case 'object':
        return '{}';
      default:
        return '';
    }
  };

  // Generate sample JSON from requestBodySchema
  const generateSampleFromSchema = (schemaJson: string | undefined): string => {
    if (!schemaJson) return '';
    try {
      const schema = JSON.parse(schemaJson);
      return JSON.stringify(generateObjectFromSchema(schema), null, 2);
    } catch {
      return '';
    }
  };

  // Recursively generate object from OpenAPI schema
  const generateObjectFromSchema = (schema: Record<string, unknown>): unknown => {
    if (!schema) return null;

    const type = schema.type as string;
    const example = schema.example;
    const defaultVal = schema.default;
    const enumVals = schema.enum as string[];
    const properties = schema.properties as Record<string, Record<string, unknown>>;
    const items = schema.items as Record<string, unknown>;

    // Use example or default if available
    if (example !== undefined) return example;
    if (defaultVal !== undefined) return defaultVal;
    if (enumVals && enumVals.length > 0) return enumVals[0];

    switch (type) {
      case 'object':
        if (properties) {
          const obj: Record<string, unknown> = {};
          for (const [key, propSchema] of Object.entries(properties)) {
            obj[key] = generateObjectFromSchema(propSchema);
          }
          return obj;
        }
        return {};
      case 'array':
        if (items) {
          return [generateObjectFromSchema(items)];
        }
        return [];
      case 'integer':
        return 1;
      case 'number':
        return 1.0;
      case 'boolean':
        return true;
      case 'string':
        return 'string';
      default:
        return null;
    }
  };

  const openTestModal = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);

    // Parse path params schema from endpoint
    const pathParamsSchema = parseSchemaJson(endpoint.pathParams);
    const initialPathParams: Record<string, string> = {};
    pathParamsSchema.forEach((param) => {
      initialPathParams[param.name] = getDefaultValue(param);
    });

    // Fallback to extracting from path if no schema
    if (pathParamsSchema.length === 0) {
      const extractedParams = extractPathParams(endpoint.path);
      extractedParams.forEach((param) => {
        initialPathParams[param] = '';
      });
    }

    // Parse query params schema from endpoint
    const queryParamsSchema = parseSchemaJson(endpoint.queryParams);
    const initialQueryParams: Record<string, string> = {};
    queryParamsSchema.forEach((param) => {
      initialQueryParams[param.name] = getDefaultValue(param);
    });

    // Generate request body from schema if sampleRequestBody is not available
    const requestBody = endpoint.sampleRequestBody || generateSampleFromSchema(endpoint.requestBodySchema);

    setTestForm({
      pathParams: initialPathParams,
      pathParamsSchema,
      queryParams: initialQueryParams,
      queryParamsSchema,
      headersText: '',
      requestBody,
    });
    setShowTestModal(true);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEndpoint) return;

    // Build request with parsed values
    const cleanedRequest: TestEndpointRequest = {};

    // Add path params if any have values
    const filledPathParams = Object.fromEntries(
      Object.entries(testForm.pathParams).filter(([, v]) => v.trim() !== '')
    );
    if (Object.keys(filledPathParams).length > 0) {
      cleanedRequest.pathParams = filledPathParams;
    }

    // Add query params if any have values
    const filledQueryParams = Object.fromEntries(
      Object.entries(testForm.queryParams).filter(([, v]) => v.trim() !== '')
    );
    if (Object.keys(filledQueryParams).length > 0) {
      cleanedRequest.queryParams = filledQueryParams;
    }

    // Parse headers from text
    if (testForm.headersText.trim()) {
      try {
        cleanedRequest.headers = JSON.parse(testForm.headersText);
      } catch {
        showError(new Error('Invalid JSON in headers'));
        return;
      }
    }

    if (testForm.requestBody) {
      cleanedRequest.requestBody = testForm.requestBody;
    }

    testEndpointMutation.mutate({
      endpointId: selectedEndpoint.id,
      request: Object.keys(cleanedRequest).length > 0 ? cleanedRequest : undefined,
    });
  };

  const openAuthModal = () => {
    setAuthForm({
      authType: project?.authType || 'NONE',
      authValue: '',
      headerName: '',
    });
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProjectMutation.mutateAsync({
        authType: authForm.authType,
        authValue: authForm.authValue || undefined,
        headerName: authForm.headerName || undefined,
      });
      showSuccess(t('success.saved'));
      setShowAuthModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClearAuth = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        authType: 'NONE',
        authValue: undefined,
        headerName: undefined,
      });
      showSuccess(t('success.saved'));
      setShowAuthModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSyncClick = () => {
    if (hasSwaggerUrls) {
      syncMutation.mutate();
    } else {
      openSwaggerModal();
    }
  };

  const openSwaggerModal = () => {
    setSwaggerUrls(project?.swaggerUrls?.length ? [...project.swaggerUrls] : ['']);
    setShowSwaggerModal(true);
  };

  const handleSwaggerSave = async (shouldSync: boolean) => {
    const filteredUrls = swaggerUrls.filter((url) => url.trim() !== '');

    try {
      await updateProjectMutation.mutateAsync({ swaggerUrls: filteredUrls });
      if (shouldSync && filteredUrls.length > 0) {
        syncMutation.mutate();
      } else {
        showSuccess(t('success.saved'));
        setShowSwaggerModal(false);
      }
    } catch {
      // Error already handled by mutation
    }
  };

  const handleSwaggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSwaggerSave(true);
  };

  const addSwaggerUrl = () => {
    setSwaggerUrls([...swaggerUrls, '']);
  };

  const removeSwaggerUrl = (index: number) => {
    const newUrls = swaggerUrls.filter((_, i) => i !== index);
    setSwaggerUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const updateSwaggerUrl = (index: number, value: string) => {
    const newUrls = [...swaggerUrls];
    newUrls[index] = value;
    setSwaggerUrls(newUrls);
  };

  const hasSwaggerUrls = project?.swaggerUrls && project.swaggerUrls.length > 0 && project.swaggerUrls.some(url => url.trim() !== '');

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">{t('project.notFound')}</p>
        <Link href="/projects">
          <Button>{t('project.backToProjects')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{project.baseUrl}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={project.authType !== 'NONE' ? 'default' : 'outline'}
            onClick={openAuthModal}
            className={cn(
              project.authType !== 'NONE' && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {project.authType !== 'NONE' ? (
              <Lock className="w-4 h-4 mr-2" />
            ) : (
              <LockOpen className="w-4 h-4 mr-2" />
            )}
            {t('project.authorize')}
          </Button>
          <Button variant="ghost" size="icon" onClick={openSwaggerModal} title={t('project.configureSwagger')}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleSyncClick} disabled={syncMutation.isPending}>
            <RefreshCw className={cn('w-4 h-4 mr-2', syncMutation.isPending && 'animate-spin')} />
            {t('project.syncApis')}
          </Button>
          <Button onClick={() => runAllMutation.mutate()} disabled={runAllMutation.isPending || !endpoints?.length}>
            <Zap className={cn('w-4 h-4 mr-2', runAllMutation.isPending && 'animate-spin')} />
            {t('project.runAllTests')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && stats.totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.totalTests')}</p>
              <p className="text-2xl font-bold">{stats.totalTests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.successRate')}</p>
              <p className={cn('text-2xl font-bold', stats.successRate >= 90 ? 'text-green-500' : 'text-yellow-500')}>
                {stats.successRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.failed')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.failedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.avgResponse')}</p>
              <p className="text-2xl font-bold">{stats.averageResponseTimeMs}ms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Endpoints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('project.endpoints')} ({endpoints?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('project.addEndpoint')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!endpoints?.length ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('project.noEndpointsTitle')}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasSwaggerUrls ? t('project.noEndpointsWithSwagger') : t('project.noEndpointsWithoutSwagger')}
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleSyncClick} disabled={syncMutation.isPending}>
                  <RefreshCw className={cn('w-4 h-4 mr-2', syncMutation.isPending && 'animate-spin')} />
                  {t('project.syncApis')}
                </Button>
                <Button variant="gradient" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('project.addEndpoint')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {endpoints.map((endpoint) => {
                const result = getResultForEndpoint(endpoint.id);
                return (
                  <div
                    key={endpoint.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <MethodBadge method={endpoint.method} />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{endpoint.path}</p>
                        {endpoint.summary && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{endpoint.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {result && (
                        <div className="flex items-center gap-3">
                          <StatusBadge status={result.status} />
                          <span className="text-sm text-gray-500">{result.responseTimeMs}ms</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(result.executedAt, language)}</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openTestModal(endpoint)}
                        disabled={testEndpointMutation.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('project.authorize')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('project.authorizeDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                {project?.authType !== 'NONE' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-400">
                      {t('project.authConfigured')}: {project?.authType}
                    </span>
                  </div>
                )}

                <Select
                  label={t('project.authType')}
                  options={[
                    { value: 'NONE', label: t('project.authNone') },
                    { value: 'BEARER_TOKEN', label: t('project.authBearer') },
                    { value: 'API_KEY', label: t('project.authApiKey') },
                    { value: 'BASIC_AUTH', label: t('project.authBasic') },
                  ]}
                  value={authForm.authType}
                  onChange={(e) => setAuthForm({ ...authForm, authType: e.target.value as AuthType })}
                />

                {authForm.authType === 'BEARER_TOKEN' && (
                  <Input
                    label={t('project.token')}
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    value={authForm.authValue}
                    onChange={(e) => setAuthForm({ ...authForm, authValue: e.target.value })}
                  />
                )}

                {authForm.authType === 'API_KEY' && (
                  <>
                    <Input
                      label={t('project.headerName')}
                      placeholder="X-API-Key"
                      value={authForm.headerName}
                      onChange={(e) => setAuthForm({ ...authForm, headerName: e.target.value })}
                    />
                    <Input
                      label={t('project.token')}
                      type="password"
                      placeholder="your-api-key"
                      value={authForm.authValue}
                      onChange={(e) => setAuthForm({ ...authForm, authValue: e.target.value })}
                    />
                  </>
                )}

                {authForm.authType === 'BASIC_AUTH' && (
                  <>
                    <Input
                      label={t('project.credentials')}
                      type="password"
                      placeholder="base64(username:password)"
                      value={authForm.authValue}
                      onChange={(e) => setAuthForm({ ...authForm, authValue: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">{t('project.basicAuthHint')}</p>
                  </>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  {project?.authType !== 'NONE' && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClearAuth}
                      className="text-red-500 hover:text-red-600"
                    >
                      {t('project.clearAuth')}
                    </Button>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <Button type="button" variant="outline" onClick={() => setShowAuthModal(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      loading={updateProjectMutation.isPending}
                      disabled={authForm.authType !== 'NONE' && !authForm.authValue}
                    >
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swagger URL Modal */}
      <AnimatePresence>
        {showSwaggerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowSwaggerModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('project.configureSwagger')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('project.configureSwaggerDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setShowSwaggerModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSwaggerSubmit} className="p-6 space-y-4">
                <div className="space-y-3">
                  {swaggerUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={t('project.swaggerUrlPlaceholder')}
                          value={url}
                          onChange={(e) => updateSwaggerUrl(index, e.target.value)}
                        />
                      </div>
                      {swaggerUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSwaggerUrl(index)}
                          className="text-red-500 hover:text-red-600 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSwaggerUrl}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('project.addUrl')}
                </Button>

                <p className="text-sm text-gray-500">{t('project.swaggerHint')}</p>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={() => setShowSwaggerModal(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSwaggerSave(false)}
                    loading={updateProjectMutation.isPending}
                  >
                    {t('common.save')}
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    loading={updateProjectMutation.isPending || syncMutation.isPending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('project.saveAndSync')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Endpoint Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('project.addEndpoint')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddEndpoint} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label={t('project.method')}
                    options={HTTP_METHODS.map((m) => ({ value: m, label: m }))}
                    value={endpointForm.method}
                    onChange={(e) => setEndpointForm({ ...endpointForm, method: e.target.value as HttpMethod })}
                  />
                  <div className="col-span-2">
                    <Input
                      label={t('project.path')}
                      placeholder="/api/users"
                      value={endpointForm.path}
                      onChange={(e) => setEndpointForm({ ...endpointForm, path: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Input
                  label={t('project.summary')}
                  placeholder={t('project.summaryPlaceholder')}
                  value={endpointForm.summary || ''}
                  onChange={(e) => setEndpointForm({ ...endpointForm, summary: e.target.value })}
                />

                <Textarea
                  label={t('project.description')}
                  placeholder={t('project.descriptionPlaceholder')}
                  value={endpointForm.description || ''}
                  onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                  rows={2}
                />

                <Input
                  type="number"
                  label={t('project.expectedStatus')}
                  placeholder="200"
                  value={endpointForm.expectedStatusCode || 200}
                  onChange={(e) => setEndpointForm({ ...endpointForm, expectedStatusCode: parseInt(e.target.value) || 200 })}
                />

                {/* Advanced Options Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ChevronDown className={cn('w-4 h-4 transition-transform', showAdvanced && 'rotate-180')} />
                  {t('project.advancedOptions')}
                </button>

                {/* Advanced Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <Textarea
                        label={t('project.headers')}
                        placeholder={t('project.headersPlaceholder')}
                        value={endpointForm.headers || ''}
                        onChange={(e) => setEndpointForm({ ...endpointForm, headers: e.target.value })}
                        rows={3}
                      />

                      <Textarea
                        label={t('project.queryParams')}
                        placeholder={t('project.queryParamsPlaceholder')}
                        value={endpointForm.queryParams || ''}
                        onChange={(e) => setEndpointForm({ ...endpointForm, queryParams: e.target.value })}
                        rows={3}
                      />

                      <Textarea
                        label={t('project.requestBody')}
                        placeholder={t('project.requestBodyPlaceholder')}
                        value={endpointForm.sampleRequestBody || ''}
                        onChange={(e) => setEndpointForm({ ...endpointForm, sampleRequestBody: e.target.value })}
                        rows={4}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="gradient" loading={createEndpointMutation.isPending}>
                    {t('project.addEndpoint')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Endpoint Modal */}
      <AnimatePresence>
        {showTestModal && selectedEndpoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowTestModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('project.testEndpoint')}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <MethodBadge method={selectedEndpoint.method} />
                    <span className="font-mono text-sm text-gray-500">{selectedEndpoint.path}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleTestSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Path Parameters */}
                {Object.keys(testForm.pathParams || {}).length > 0 ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('project.pathParams')}
                    </label>
                    {Object.keys(testForm.pathParams || {}).map((param) => {
                      const schema = testForm.pathParamsSchema.find((s) => s.name === param);
                      const typeInfo = schema?.schema?.type || 'string';
                      const isRequired = schema?.required !== false;
                      return (
                        <div key={param} className="flex items-center gap-2">
                          <div className="w-32 shrink-0">
                            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{`{${param}}`}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {typeInfo}
                              </span>
                              {isRequired && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </div>
                          </div>
                          <Input
                            placeholder={schema?.description || param}
                            value={testForm.pathParams?.[param] || ''}
                            onChange={(e) =>
                              setTestForm({
                                ...testForm,
                                pathParams: { ...testForm.pathParams, [param]: e.target.value },
                              })
                            }
                            required={isRequired}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">{t('project.noPathParams')}</p>
                )}

                {/* Query Parameters */}
                {testForm.queryParamsSchema.length > 0 ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('project.queryParams')}
                    </label>
                    {testForm.queryParamsSchema.map((schema) => {
                      const typeInfo = schema.schema?.type || 'string';
                      const isRequired = schema.required === true;
                      const enumValues = schema.schema?.enum;
                      const hasEnum = enumValues && enumValues.length > 0;
                      return (
                        <div key={schema.name} className="flex items-center gap-2">
                          <div className="w-32 shrink-0">
                            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{schema.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                {hasEnum ? 'enum' : typeInfo}
                              </span>
                              {isRequired && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </div>
                          </div>
                          {hasEnum ? (
                            <Select
                              options={enumValues.map((v) => ({ value: v, label: v }))}
                              value={testForm.queryParams[schema.name] || ''}
                              onChange={(e) =>
                                setTestForm({
                                  ...testForm,
                                  queryParams: { ...testForm.queryParams, [schema.name]: e.target.value },
                                })
                              }
                            />
                          ) : (
                            <Input
                              placeholder={schema.description || schema.name}
                              value={testForm.queryParams[schema.name] || ''}
                              onChange={(e) =>
                                setTestForm({
                                  ...testForm,
                                  queryParams: { ...testForm.queryParams, [schema.name]: e.target.value },
                                })
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">{t('project.noQueryParams')}</p>
                )}

                {/* Headers */}
                <Textarea
                  label={t('project.headers')}
                  placeholder={t('project.headersPlaceholder')}
                  value={testForm.headersText}
                  onChange={(e) => setTestForm({ ...testForm, headersText: e.target.value })}
                  rows={3}
                />

                {/* Request Body (for POST, PUT, PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                  <div className="space-y-2">
                    <Textarea
                      label={t('project.requestBody')}
                      placeholder={t('project.requestBodyPlaceholder')}
                      value={testForm.requestBody || ''}
                      onChange={(e) => setTestForm({ ...testForm, requestBody: e.target.value })}
                      rows={8}
                    />
                    {selectedEndpoint.requestBodySchema && (
                      <p className="text-xs text-gray-500">
                        {t('project.schemaAvailable')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={() => setShowTestModal(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="gradient" loading={testEndpointMutation.isPending}>
                    <Play className="w-4 h-4 mr-2" />
                    {t('project.runTest')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
