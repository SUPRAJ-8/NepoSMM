"use client";

import { API_URL } from '@/lib/api-config'


import { useState, useEffect } from 'react';
import { Mail, Send, Eye, Loader2, CheckCircle2, XCircle, Maximize2, X, ExternalLink } from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    requiredFields: string[];
}

interface TemplateData {
    [key: string]: string;
}

export default function EmailTestingPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [templateData, setTemplateData] = useState<TemplateData>({});
    const [testEmail, setTestEmail] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewSubject, setPreviewSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('nepo_admin_token');
            const response = await fetch(`${API_URL}/email-test/templates`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateSelect = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setPreviewHtml('');
        setPreviewSubject('');
        setMessage(null);

        // Initialize template data with default values
        const defaultData: TemplateData = {};
        template.requiredFields.forEach(field => {
            defaultData[field] = getDefaultValue(field);
        });
        setTemplateData(defaultData);
    };

    const getDefaultValue = (field: string): string => {
        const defaults: { [key: string]: string } = {
            username: 'John Doe',
            resetLink: 'https://example.com/reset-password?token=sample123',
            orderId: '12345',
            serviceName: 'Instagram Followers',
            amount: '$10.00',
            newBalance: '$110.00',
            method: 'Credit Card',
        };
        return defaults[field] || '';
    };

    const handlePreview = async () => {
        if (!selectedTemplate) return;

        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('nepo_admin_token');
            const response = await fetch(`${API_URL}/email-test/preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    data: templateData,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPreviewHtml(data.html);
                setPreviewSubject(data.subject);
            } else {
                setMessage({ type: 'error', text: 'Failed to preview template' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error previewing template' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!selectedTemplate || !testEmail) {
            setMessage({ type: 'error', text: 'Please enter a test email address' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('nepo_admin_token');
            const response = await fetch(`${API_URL}/email-test/send-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    data: templateData,
                    testEmail,
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Test email sent to ${testEmail}!` });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to send test email' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error sending test email' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Email Template Testing
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 ml-16">
                        Preview and test email templates without triggering actual events
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Template List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                                Available Templates
                            </h2>
                            <div className="space-y-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template)}
                                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${selectedTemplate?.id === template.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                                            : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                                            }`}
                                    >
                                        <div className="font-medium">{template.name}</div>
                                        <div className={`text-sm mt-1 ${selectedTemplate?.id === template.id
                                            ? 'text-blue-100'
                                            : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {template.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Configuration & Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedTemplate ? (
                            <>
                                {/* Configuration */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                                        Template Data
                                    </h2>
                                    <div className="space-y-4">
                                        {selectedTemplate.requiredFields.map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 capitalize">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={templateData[field] || ''}
                                                    onChange={(e) =>
                                                        setTemplateData({ ...templateData, [field]: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder={`Enter ${field}`}
                                                />
                                            </div>
                                        ))}

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Test Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="your@email.com"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={handlePreview}
                                                disabled={loading}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                                Preview
                                            </button>
                                            <button
                                                onClick={handleSendTest}
                                                disabled={loading || !testEmail}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                                Send Test
                                            </button>
                                        </div>

                                        {/* Message */}
                                        {message && (
                                            <div
                                                className={`flex items-center gap-2 p-4 rounded-xl ${message.type === 'success'
                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                                    }`}
                                            >
                                                {message.type === 'success' ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                                <span>{message.text}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preview */}
                                {previewHtml && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                                Email Preview
                                            </h2>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowFullscreen(true)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
                                                    title="Fullscreen Preview"
                                                >
                                                    <Maximize2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const win = window.open('', '_blank');
                                                        if (win) {
                                                            win.document.write(previewHtml);
                                                            win.document.title = previewSubject;
                                                            win.document.close();
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
                                                    title="Open in New Tab"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Subject: </span>
                                            <span className="text-slate-800 dark:text-white">{previewSubject}</span>
                                        </div>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            <iframe
                                                srcDoc={previewHtml}
                                                className="w-full h-96 bg-white"
                                                title="Email Preview"
                                                sandbox="allow-same-origin"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 border border-slate-200 dark:border-slate-700 text-center">
                                <Mail className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg">
                                    Select a template to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Preview Modal */}
            {showFullscreen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-4 text-white">
                        <div>
                            <h3 className="text-xl font-bold">{selectedTemplate?.name} - Full Preview</h3>
                            <p className="text-slate-400 text-sm">Subject: {previewSubject}</p>
                        </div>
                        <button
                            onClick={() => setShowFullscreen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-full border-none"
                            title="Full Email Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}