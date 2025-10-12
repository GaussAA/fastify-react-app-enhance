/**
 * 聊天设置组件
 * 配置模型参数和设置
 */

import { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLLMStore } from '@/store/llm';
import { LLMChatConfig, DEFAULT_CHAT_CONFIG } from '@/types/llm';

interface ChatSettingsProps {
    onClose: () => void;
}

export function ChatSettings({ onClose }: ChatSettingsProps) {
    const { config, updateConfig, resetConfig, models, loadModels } = useLLMStore();
    const [localConfig, setLocalConfig] = useState<LLMChatConfig>(config);

    useEffect(() => {
        setLocalConfig(config);
        loadModels();
    }, [config, loadModels]);

    const handleSave = () => {
        updateConfig(localConfig);
        onClose();
    };

    const handleReset = () => {
        setLocalConfig(DEFAULT_CHAT_CONFIG);
    };

    const handleInputChange = (field: keyof LLMChatConfig, value: string | number) => {
        setLocalConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>聊天设置</CardTitle>
                    <Button
                        onClick={onClose}
                        size="sm"
                        variant="ghost"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* 模型选择 */}
                    <div className="space-y-2">
                        <Label htmlFor="model">模型</Label>
                        <div className="flex flex-wrap gap-2">
                            {models.map((model) => (
                                <Badge
                                    key={model.id}
                                    variant={localConfig.model === model.id ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => handleInputChange('model', model.id)}
                                >
                                    {model.id}
                                </Badge>
                            ))}
                        </div>
                        <Input
                            id="model"
                            value={localConfig.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            placeholder="输入模型名称"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 温度 */}
                        <div className="space-y-2">
                            <Label htmlFor="temperature">温度 (Temperature)</Label>
                            <Input
                                id="temperature"
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                value={localConfig.temperature}
                                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                控制输出的随机性，0-2之间，越高越随机
                            </p>
                        </div>

                        {/* 最大令牌数 */}
                        <div className="space-y-2">
                            <Label htmlFor="max_tokens">最大令牌数</Label>
                            <Input
                                id="max_tokens"
                                type="number"
                                min="1"
                                value={localConfig.max_tokens}
                                onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                控制回复的最大长度
                            </p>
                        </div>

                        {/* Top P */}
                        <div className="space-y-2">
                            <Label htmlFor="top_p">Top P</Label>
                            <Input
                                id="top_p"
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={localConfig.top_p}
                                onChange={(e) => handleInputChange('top_p', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                核采样参数，0-1之间
                            </p>
                        </div>

                        {/* 频率惩罚 */}
                        <div className="space-y-2">
                            <Label htmlFor="frequency_penalty">频率惩罚</Label>
                            <Input
                                id="frequency_penalty"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={localConfig.frequency_penalty}
                                onChange={(e) => handleInputChange('frequency_penalty', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                减少重复内容的可能性
                            </p>
                        </div>

                        {/* 存在惩罚 */}
                        <div className="space-y-2">
                            <Label htmlFor="presence_penalty">存在惩罚</Label>
                            <Input
                                id="presence_penalty"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={localConfig.presence_penalty}
                                onChange={(e) => handleInputChange('presence_penalty', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                鼓励模型谈论新话题
                            </p>
                        </div>
                    </div>

                    {/* 预设配置 */}
                    <div className="space-y-2">
                        <Label>预设配置</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocalConfig({
                                    ...DEFAULT_CHAT_CONFIG,
                                    model: localConfig.model
                                })}
                            >
                                默认
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocalConfig({
                                    ...localConfig,
                                    temperature: 0.1,
                                    top_p: 0.9
                                })}
                            >
                                保守
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocalConfig({
                                    ...localConfig,
                                    temperature: 1.2,
                                    top_p: 0.8
                                })}
                            >
                                创意
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocalConfig({
                                    ...localConfig,
                                    temperature: 0.5,
                                    max_tokens: 1000
                                })}
                            >
                                简洁
                            </Button>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            重置
                        </Button>
                        <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            保存
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
