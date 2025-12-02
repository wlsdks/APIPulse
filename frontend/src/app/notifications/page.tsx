'use client';

import { InteractiveCard, StaggerContainer, StaggerItem } from '@/components/motion';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import { createNotification, deleteNotification, getNotifications } from '@/lib/api';
import type { CreateNotificationRequest, NotificationType } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateNotificationRequest>({
    name: '',
    type: 'SLACK',
    webhookUrl: '',
    emailRecipients: '',
    notifyOnFailure: true,
    notifyOnRecovery: true,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsModalOpen(false);
      setFormData({ name: '', type: 'SLACK', webhookUrl: '', emailRecipients: '' });
      showSuccess(t('success.notificationSent'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SLACK':
      case 'DISCORD':
        return <MessageSquare className="w-5 h-5" />;
      case 'EMAIL':
        return <Mail className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'SLACK':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-500';
      case 'DISCORD':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500';
      case 'EMAIL':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-500';
    }
  };

  const typeOptions = [
    { value: 'SLACK', label: t('notifications.slack') },
    { value: 'DISCORD', label: t('notifications.discord') },
    { value: 'EMAIL', label: t('notifications.email') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')}>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('notifications.add')}
        </Button>
      </PageHeader>

      {!notifications?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('notifications.noChannels')}
            </h3>
            <p className="text-gray-500 mb-6">{t('notifications.addDescription')}</p>
            <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('notifications.addFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <StaggerItem key={notification.id}>
              <InteractiveCard>
                <Card variant="elevated" className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getIconBg(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <CardTitle className="text-base">{notification.name}</CardTitle>
                    </div>
                    <Badge variant={notification.enabled ? 'success' : 'default'}>
                      {notification.enabled ? t('notifications.active') : t('common.disabled')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500 mb-4">{notification.type}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {notification.notifyOnFailure && (
                          <Badge variant="error">{t('notifications.onFailure')}</Badge>
                        )}
                        {notification.notifyOnRecovery && (
                          <Badge variant="success">{t('notifications.onRecovery')}</Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t('notifications.confirmDelete'))) {
                            deleteMutation.mutate(notification.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </InteractiveCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('notifications.addModal')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('notifications.channelName')}
            placeholder={t('notifications.channelNamePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label={t('notifications.type')}
            options={typeOptions}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as NotificationType })
            }
          />

          {(formData.type === 'SLACK' || formData.type === 'DISCORD') && (
            <Input
              label={t('notifications.webhook')}
              placeholder={t('notifications.webhookPlaceholder')}
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              required
            />
          )}

          {formData.type === 'EMAIL' && (
            <Input
              label={t('notifications.emailRecipients')}
              placeholder={t('notifications.emailRecipientsPlaceholder')}
              value={formData.emailRecipients}
              onChange={(e) => setFormData({ ...formData, emailRecipients: e.target.value })}
              required
            />
          )}

          <div className="space-y-3 py-2">
            <Toggle
              label={t('notifications.notifyOnFailure')}
              checked={formData.notifyOnFailure}
              onChange={(e) => setFormData({ ...formData, notifyOnFailure: e.target.checked })}
            />
            <Toggle
              label={t('notifications.notifyOnRecovery')}
              checked={formData.notifyOnRecovery}
              onChange={(e) => setFormData({ ...formData, notifyOnRecovery: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="gradient" loading={createMutation.isPending}>
              {t('notifications.add')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
