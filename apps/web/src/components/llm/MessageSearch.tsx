import { useState } from 'react';
import { Search, X, Filter, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MessageSearchProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    messageCount: number;
    className?: string;
}

export function MessageSearch({ onSearch, onClear, messageCount, className }: MessageSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(query.length > 0);
        onSearch(query);
    };

    const handleClear = () => {
        setSearchQuery('');
        setIsSearching(false);
        onClear();
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="搜索消息..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 h-9 text-sm border-slate-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 rounded-lg"
                />
                {isSearching && (
                    <Button
                        onClick={handleClear}
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border-blue-200 rounded-full">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {messageCount} 条消息
                </Badge>

                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs hover:bg-slate-50 rounded-lg"
                >
                    <Filter className="h-3 w-3 mr-1" />
                    筛选
                </Button>
            </div>
        </div>
    );
}
