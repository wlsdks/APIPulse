'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Database, Globe, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure API Pulse settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Server className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Backend Connection</CardTitle>
              <CardDescription>Configure the API Pulse backend server</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="API Base URL"
            value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}
            disabled
          />
          <p className="text-sm text-gray-500">
            Set the NEXT_PUBLIC_API_URL environment variable to change this.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Database className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Database</CardTitle>
              <CardDescription>View database configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              Database type is configured via the APIPULSE_PROFILE environment variable on the backend.
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">sqlite</code> - SQLite (default)</li>
              <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">postgresql</code> - PostgreSQL</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>About API Pulse</CardTitle>
              <CardDescription>Application information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Backend:</strong> Spring Boot 4.0.0 (Kotlin)</p>
            <p><strong>Frontend:</strong> Next.js 16</p>
            <p className="pt-2">
              <a
                href="https://github.com/your-org/api-pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
