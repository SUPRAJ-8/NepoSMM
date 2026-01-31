"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Hash, Tag, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, GripVertical, LayoutGrid, Facebook, Instagram, Twitter, Youtube, Linkedin, Twitch, Music2, MessageCircle, Send, Globe, Smartphone, Video, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BACKEND_URL = 'http://localhost:5000';

function SortableCategoryRow({
    item,
    index,
    onToggleStatus,
    onRename,
    onSortOrderUpdate
}: {
    item: any,
    index: number,
    onToggleStatus: (cat: string, status: boolean) => void,
    onRename: (cat: any) => void,
    onSortOrderUpdate: (cat: string, order: number) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.category });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
        opacity: isDragging ? 0.8 : 1,
        backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.05)' : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0",
                isDragging && "shadow-2xl border-cyan-500/50"
            )}
        >
            <div className="col-span-1 text-center text-gray-500 font-mono text-xs">
                {index + 1}
            </div>
            <div className="col-span-4 font-bold text-white text-sm truncate" title={item.category}>
                {item.category}
            </div>
            <div className="col-span-1 flex items-center justify-center gap-1 group/sort">
                <Input
                    type="number"
                    value={item.sort_order || 0}
                    onChange={(e) => onSortOrderUpdate(item.category, parseInt(e.target.value) || 0)}
                    className="w-12 h-8 text-center bg-[#1e293b] border-white/5 text-xs font-mono text-cyan-400 focus-visible:ring-cyan-500/30 p-0"
                />
            </div>
            <div className="col-span-2 text-gray-400 text-xs truncate" title={item.providers}>
                {item.providers || "Unknown"}
            </div>
            <div className="col-span-1 text-center">
                <span className="px-2 py-1 rounded-md bg-[#1e293b] border border-white/5 text-xs font-mono text-cyan-400">
                    {item.total_services}
                </span>
            </div>
            <div className="col-span-1 flex justify-center">
                <div className="flex items-center gap-3">
                    <Switch
                        checked={item.active_services > 0}
                        onCheckedChange={(checked) => onToggleStatus(item.category, checked)}
                        className="data-[state=checked]:bg-cyan-500 h-5 w-9"
                    />
                </div>
            </div>
            <div className="col-span-2 flex justify-center gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 text-gray-400 transition-colors"
                    onClick={() => onRename({ oldName: item.category, newName: item.category })}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}



// Brand Icons Helper
const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('best services') || lower.includes('neposmm') || lower.includes('promotion')) return <Sparkles className="h-5 w-5 text-yellow-400" />;
    if (lower.includes('facebook')) return <Facebook className="h-5 w-5" />;
    if (lower.includes('instagram') || lower.includes('ig')) return <Instagram className="h-5 w-5" />;
    if (lower.includes('twitter') || lower.includes('x ')) return <Twitter className="h-5 w-5" />;
    if (lower.includes('youtube') || lower.includes('yt')) return <Youtube className="h-5 w-5" />;
    if (lower.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (lower.includes('twitch')) return <Twitch className="h-5 w-5" />;
    if (lower.includes('tiktok')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>;
    if (lower.includes('whatsapp')) return <MessageCircle className="h-5 w-5" />;
    if (lower.includes('telegram')) return <Send className="h-5 w-5" />;
    if (lower.includes('spotify')) return <Music2 className="h-5 w-5" />;
    if (lower.includes('website') || lower.includes('traffic')) return <Globe className="h-5 w-5" />;
    if (lower.includes('mobile') || lower.includes('app')) return <Smartphone className="h-5 w-5" />;
    if (lower.includes('video')) return <Video className="h-5 w-5" />;
    return <Hash className="h-5 w-5" />;
};

const getPlatform = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('best services') || lower.includes('neposmm') || lower.includes('promotion')) return 'NepoSmm Selection';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('instagram') || lower.includes('ig')) return 'Instagram';
    if (lower.includes('twitter') || lower.includes('x ')) return 'Twitter/X';
    if (lower.includes('youtube') || lower.includes('yt')) return 'YouTube';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower.includes('twitch')) return 'Twitch';
    if (lower.includes('tiktok')) return 'TikTok';
    if (lower.includes('whatsapp')) return 'WhatsApp';
    if (lower.includes('telegram')) return 'Telegram';
    if (lower.includes('spotify')) return 'Spotify';
    if (lower.includes('website') || lower.includes('traffic')) return 'Website Traffic';
    if (lower.includes('mobile') || lower.includes('app')) return 'Mobile Apps';
    if (lower.includes('video')) return 'Video';
    return 'Other';
};

function SortablePlatformIcon({ platform, count }: { platform: string, count: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: platform });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "h-14 w-14 flex flex-col items-center justify-center bg-[#1e293b] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:border-cyan-500/50 hover:bg-white/[0.03] transition-all group relative",
                isDragging && "bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
            )}
            title={`${platform} (${count} categories)`}
        >
            <div className={cn(
                "text-gray-400 group-hover:text-cyan-400 transition-colors mb-0.5",
                isDragging && "text-cyan-400"
            )}>
                {getCategoryIcon(platform)}
            </div>
            <span className="text-[9px] font-bold text-gray-500 group-hover:text-white transition-colors">{count}</span>

            {/* Hover Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <div className="bg-black/90 text-[10px] text-white px-2 py-1 rounded border border-white/10">
                    {platform}
                </div>
            </div>

            {/* Drag Handle Indicator (Micro) */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50">
                <GripVertical className="h-2 w-2 text-gray-500" />
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'sort_order', direction: 'asc' });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/services/categories`);
            if (response.ok) {
                const data = await response.json();
                // Basic initial sort if API doesn't guarantee it
                const sorted = data.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
                setCategories(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedPlatforms = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        categories.forEach(cat => {
            const platform = getPlatform(cat.category);
            if (!groups[platform]) groups[platform] = [];
            groups[platform].push(cat);
        });

        // Sort platforms by the lowest sort_order of their items 
        // effectively finding the "leaders"
        return Object.keys(groups).sort((a, b) => {
            const minA = Math.min(...groups[a].map((c: any) => c.sort_order || 0));
            const minB = Math.min(...groups[b].map((c: any) => c.sort_order || 0));
            return minA - minB;
        });
    }, [categories]);

    const handlePlatformDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = groupedPlatforms.indexOf(active.id as string);
            const newIndex = groupedPlatforms.indexOf(over.id as string);

            // Reorder the platforms
            const newPlatformOrder = arrayMove(groupedPlatforms, oldIndex, newIndex);

            // Now reconstruct the ENTIRE categories list based on this new platform order
            // We want to keep internal sorting of categories within a platform intact
            let newCategoriesList: any[] = [];

            // Temporary map to access categories by platform for rebuilding
            const groups: Record<string, any[]> = {};
            categories.forEach(cat => {
                const platform = getPlatform(cat.category);
                if (!groups[platform]) groups[platform] = [];
                // Ensure they are sorted by their existing order to preserve internal rank
                groups[platform].push(cat);
            });
            // Sort internals
            Object.keys(groups).forEach(p => {
                groups[p].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
            });

            // Flatten logic
            newPlatformOrder.forEach(platform => {
                if (groups[platform]) {
                    newCategoriesList = [...newCategoriesList, ...groups[platform]];
                }
            });

            // Assign new sort_order indices
            const updatedCategories = newCategoriesList.map((cat, idx) => ({
                ...cat,
                sort_order: idx
            }));

            setCategories(updatedCategories);
            persistSortOrder(updatedCategories);
        }
    };

    const handleTableDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.category === active.id);
            const newIndex = categories.findIndex((c) => c.category === over.id);

            const newCategories = arrayMove(categories, oldIndex, newIndex);

            // Update sort_order for all categories based on index
            const updatedCategories = newCategories.map((cat, idx) => ({
                ...cat,
                sort_order: idx
            }));

            setCategories(updatedCategories);
            persistSortOrder(updatedCategories);
        }
    };

    const persistSortOrder = async (updatedCategories: any[]) => {
        try {
            await Promise.all(updatedCategories.map(cat =>
                fetch(`${BACKEND_URL}/api/services/categories/sort`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: cat.category, sort_order: cat.sort_order })
                })
            ));
        } catch (err) {
            console.error("Failed to persist new order", err);
            fetchCategories();
        }
    };

    const handleToggleStatus = async (category: string, isActive: boolean) => {
        // Optimistically update local state immediately
        setCategories(prev => prev.map(c => {
            if (c.category === category) {
                return {
                    ...c,
                    active_services: isActive ? c.total_services : 0
                };
            }
            return c;
        }));

        const newStatus = isActive ? 'active' : 'inactive';
        try {
            await fetch(`${BACKEND_URL}/api/services/categories/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, status: newStatus })
            });
            // No need to refetch, local state is already updated
        } catch (error) {
            console.error('Failed to toggle status:', error);
            // Revert on error (optional, but good practice)
            fetchCategories();
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(c =>
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedCategories = React.useMemo(() => {
        let sortableItems = [...filteredCategories];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle various types
                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredCategories, sortConfig]);

    const [editingCategory, setEditingCategory] = useState<{ oldName: string, newName: string } | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);

    const handleRename = async () => {
        if (!editingCategory || !editingCategory.newName.trim() || editingCategory.newName === editingCategory.oldName) return;

        setIsRenaming(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/services/categories/rename`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldName: editingCategory.oldName, newName: editingCategory.newName })
            });

            if (response.ok) {
                setEditingCategory(null);
                fetchCategories();
            }
        } catch (error) {
            console.error('Failed to rename category:', error);
        } finally {
            setIsRenaming(false);
        }
    };

    const handleSortOrderUpdate = async (category: string, newOrder: number) => {
        // Optimistically update
        setCategories(prev => prev.map(c => {
            if (c.category === category) return { ...c, sort_order: newOrder };
            return c;
        }));

        try {
            await fetch(`${BACKEND_URL}/api/services/categories/sort`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, sort_order: newOrder })
            });
        } catch (error) {
            console.error('Failed to update sort order:', error);
            fetchCategories();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Category Management</h1>
                    <p className="text-gray-400 text-sm mt-1">View and manage service categories from all providers</p>
                </div>
                <Button onClick={fetchCategories} className="h-10 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold gap-2 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    Refresh Categories
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">TOTAL CATEGORIES</div>
                        <div className="text-2xl font-bold text-white">{categories.length}</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#1e293b] flex items-center justify-center border border-white/5">
                        <Tag className="h-6 w-6 text-cyan-400" />
                    </div>
                </div>
                <div className="md:col-span-2 bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#1e293b] flex items-center justify-center border border-white/5">
                                <LayoutGrid className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Reorder</div>
                                <div className="text-xs text-gray-400">Drag to sort categories instantly</div>
                            </div>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handlePlatformDragEnd}
                    >
                        <SortableContext
                            items={groupedPlatforms}
                            strategy={rectSortingStrategy}
                        >
                            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                {groupedPlatforms.map((platform) => {
                                    const count = categories.filter(c => getPlatform(c.category) === platform).length;
                                    return (
                                        <SortablePlatformIcon key={platform} platform={platform} count={count} />
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-11 h-12 bg-[#0f172a] border-white/5 rounded-xl text-sm focus-visible:ring-cyan-500/50 text-white"
                />
            </div>

            {/* Categories Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center">
                    <div className="col-span-1 text-center">#</div>
                    <div
                        className="col-span-4 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('category')}
                    >
                        Category Name <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                        className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-white transition-colors flex justify-center"
                        onClick={() => handleSort('sort_order')}
                    >
                        Sort <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                        className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('providers')}
                    >
                        Provider <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                        className="col-span-1 text-center cursor-pointer hover:text-white transition-colors flex justify-center gap-2"
                        onClick={() => handleSort('total_services')}
                    >
                        Services <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                        className="col-span-1 text-center cursor-pointer hover:text-white transition-colors flex justify-center gap-2"
                        onClick={() => handleSort('active_services')}
                    >
                        Status <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400">Loading categories...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                                <Tag className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Categories Found</h3>
                            <p className="text-gray-400 text-sm">Synchronize providers to see categories here.</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleTableDragEnd}
                        >
                            <SortableContext
                                items={sortedCategories.map(c => c.category)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sortedCategories.map((item, index) => (
                                    <SortableCategoryRow
                                        key={item.category}
                                        item={item}
                                        index={index}
                                        onToggleStatus={handleToggleStatus}
                                        onRename={setEditingCategory}
                                        onSortOrderUpdate={handleSortOrderUpdate}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                <div className="p-4 flex items-center justify-between text-xs text-gray-500 font-medium border-t border-white/5">
                    <div>SHOWING <span className="text-white">{filteredCategories.length}</span> OF {categories.length} CATEGORIES</div>
                </div>
            </div>

            {/* Rename Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent
                    className="bg-[#0f172a] border-white/10 text-white sm:max-w-[425px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Category Name</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Make changes to the category name here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="oldName" className="text-right text-gray-400">
                                Original
                            </Label>
                            <Input
                                id="oldName"
                                value={editingCategory?.oldName || ''}
                                disabled
                                className="col-span-3 bg-[#1e293b] border-white/5 text-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newName" className="text-right">
                                New Name
                            </Label>
                            <Input
                                id="newName"
                                value={editingCategory?.newName || ''}
                                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, newName: e.target.value } : null)}
                                className="col-span-3 bg-[#1e293b] border-white/5 focus-visible:ring-cyan-500/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        <Button type="submit" onClick={handleRename} disabled={isRenaming} className="bg-cyan-500 hover:bg-cyan-600">
                            {isRenaming ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );

}