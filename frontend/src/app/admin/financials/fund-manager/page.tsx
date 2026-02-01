"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    CreditCard, Edit, Trash2, Plus, GripVertical, CheckCircle2, XCircle, Upload, MoveVertical
} from "lucide-react"
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
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function FundManagerPage() {
    const [methods, setMethods] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<any>(null)
    const [methodToDelete, setMethodToDelete] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "crypto",
        bonus_percentage: "0",
        charge_fee_percentage: "0",
        instructions: "",
        qr_code_url: "",
        input_fields: [] as any[],
        is_active: true,
        currency: "USD"
    })

    const fetchMethods = async () => {
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/payment-methods?all=true`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setMethods(data)
            }
        } catch (error) {
            console.error("Error fetching methods:", error)
            toast.error("Failed to load payment methods")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMethods()
    }, [])

    const handleOpenDialog = (method?: any) => {
        if (method) {
            setEditingMethod(method)
            setFormData({
                name: method.name,
                description: method.description,
                type: method.type,
                bonus_percentage: method.bonus_percentage.toString(),
                charge_fee_percentage: method.charge_fee_percentage?.toString() || "0",
                instructions: (() => {
                    try {
                        const parsed = method.instructions ? JSON.parse(method.instructions) : [];
                        return Array.isArray(parsed) ? parsed.join("\n") : method.instructions || "";
                    } catch {
                        return method.instructions || "";
                    }
                })(),
                qr_code_url: method.qr_code_url || "",
                input_fields: (() => {
                    try {
                        const parsed = method.input_fields ? JSON.parse(method.input_fields) : [];
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return [];
                    }
                })(),
                is_active: method.is_active,
                currency: method.currency || "USD"
            })
        } else {
            setEditingMethod(null)
            setFormData({
                name: "",
                description: "",
                type: "crypto",
                bonus_percentage: "0",
                charge_fee_percentage: "0",
                instructions: "",
                qr_code_url: "",
                input_fields: [],
                is_active: true,
                currency: "USD"
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const instructions = formData.instructions || ""
            const instructionsArray = JSON.stringify(instructions.split('\n').filter((i: string) => i.trim()))

            const payload = {
                ...formData,
                bonus_percentage: parseFloat(formData.bonus_percentage) || 0,
                charge_fee_percentage: parseFloat(formData.charge_fee_percentage) || 0,
                instructions: instructionsArray,
                input_fields: JSON.stringify(formData.input_fields)
            }

            let response
            if (editingMethod) {
                response = await fetch(`${API_URL}/payment-methods/${editingMethod.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                })
            } else {
                response = await fetch(`${API_URL}/payment-methods`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                })
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || "Failed to save method");
            }

            toast.success(editingMethod ? "Method updated" : "Method created")
            setIsDialogOpen(false)
            fetchMethods()
        } catch (error: any) {
            console.error("Error saving method:", error)
            toast.error(error.message || "Failed to save payment method")
        }
    }


    const handleDelete = async (id: number) => {
        setIsDeleteDialogOpen(true)
        setMethodToDelete(id)
    }

    const confirmDelete = async () => {
        if (!methodToDelete) return

        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/payment-methods/${methodToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Method deleted")
            setIsDeleteDialogOpen(false)
            setMethodToDelete(null)
            fetchMethods()
        } catch (error) {
            console.error("Error deleting method:", error)
            toast.error("Failed to delete method")
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setFormData(prev => ({ ...prev, qr_code_url: data.url }))
            toast.success("QR Code uploaded successfully")
        } catch (error) {
            console.error("Error uploading file:", error)
            toast.error("Failed to upload QR code")
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = methods.findIndex((m) => m.id === active.id);
            const newIndex = methods.findIndex((m) => m.id === over.id);

            const newMethods = arrayMove(methods, oldIndex, newIndex);
            setMethods(newMethods);

            // Save to backend
            try {
                const token = localStorage.getItem("nepo_admin_token");
                const orders = newMethods.map((m, idx) => ({ id: m.id, sort_order: idx + 1 }));

                await fetch(`${API_URL}/payment-methods/reorder`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ orders })
                });
                toast.success("Order saved");
            } catch (error) {
                console.error("Error saving order:", error);
                toast.error("Failed to save new order");
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Fund Manager</h1>
                    <p className="text-gray-400 font-medium">Manage payment gateways and deposit methods</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2 h-12 px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Add New Method
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={methods.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="grid gap-6">
                        {methods.map((method) => (
                            <SortableMethodCard
                                key={method.id}
                                method={method}
                                handleOpenDialog={handleOpenDialog}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-0 overflow-hidden max-w-2xl h-[90vh] flex flex-col">
                    <DialogHeader className="p-8 pb-4 shrink-0 border-b border-white/5">
                        <DialogTitle className="text-3xl font-black text-white">
                            {editingMethod ? "Edit Payment Method" : "Add New Payment Method"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Configure your payment gateway details, instructions, and custom input fields.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-scroll p-8 space-y-8 scroll-smooth custom-scrollbar">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Method Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 bg-[#020617] border-white/10 text-white rounded-xl focus:ring-blue-500/20"
                                    placeholder="e.g. Fonepay, USDT (TRC-20)"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="h-12 bg-[#020617] border-white/10 text-white rounded-xl"
                                    placeholder="e.g. Instant Bank Transfer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bonus %</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.bonus_percentage}
                                        onChange={(e) => setFormData({ ...formData, bonus_percentage: e.target.value })}
                                        className="h-12 bg-[#020617] border-white/10 text-white rounded-xl pr-8"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Charge Fee %</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.charge_fee_percentage}
                                        onChange={(e) => setFormData({ ...formData, charge_fee_percentage: e.target.value })}
                                        className="h-12 bg-[#020617] border-white/10 text-white rounded-xl pr-8"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Currency</Label>
                                <Input
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                    className="h-12 bg-[#020617] border-white/10 text-white rounded-xl"
                                    placeholder="e.g. USD, NPR, INR"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment Instructions</Label>
                            <Textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                className="bg-[#020617] border-white/10 text-white min-h-[120px] rounded-xl focus:ring-blue-500/20"
                                placeholder="Enter payment instructions, one per line..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">QR Code (Optional)</Label>
                            <div
                                className={cn(
                                    "relative h-48 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden group",
                                    formData.qr_code_url
                                        ? "border-emerald-500/50 bg-emerald-500/5"
                                        : "border-blue-500/50 bg-blue-500/5 hover:border-blue-500 hover:bg-blue-500/10"
                                )}
                                onClick={() => document.getElementById('qr-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="qr-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                {formData.qr_code_url ? (
                                    <>
                                        <img src={formData.qr_code_url} alt="QR Preview" className="h-full w-full object-contain p-4" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                            <Upload className="h-6 w-6 text-white" />
                                            <span className="text-white text-sm font-bold">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-full bg-white/5 text-gray-400 group-hover:text-blue-400 transition-colors">
                                            <Upload className="h-8 w-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-white">Click to upload QR Code</p>
                                            <p className="text-xs text-gray-500">PNG, JPG or SVG</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Custom Input Fields</Label>
                                    <p className="text-xs text-gray-600">Add info you need from the user (e.g. Transaction ID)</p>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl font-bold"
                                    onClick={() => setFormData({
                                        ...formData,
                                        input_fields: [...formData.input_fields, { id: Date.now(), name: "", label: "", placeholder: "", type: "text", required: true }]
                                    })}
                                >
                                    <Plus size={16} className="mr-1" /> Add Field
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.input_fields.map((field, idx) => (
                                    <div key={field.id || idx} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-5 space-y-4 relative group">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4 h-8 w-8 p-0 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                                            onClick={() => {
                                                const newFields = [...formData.input_fields];
                                                newFields.splice(idx, 1);
                                                setFormData({ ...formData, input_fields: newFields });
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-500 uppercase">Field Label</Label>
                                                <Input
                                                    value={field.label}
                                                    onChange={(e) => {
                                                        const newFields = [...formData.input_fields];
                                                        newFields[idx].label = e.target.value;
                                                        newFields[idx].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                                        setFormData({ ...formData, input_fields: newFields });
                                                    }}
                                                    placeholder="e.g. Transaction ID"
                                                    className="h-10 bg-[#020617] border-white/5 text-sm text-white focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-500 uppercase">Input Type</Label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => {
                                                        const newFields = [...formData.input_fields];
                                                        newFields[idx].type = e.target.value;
                                                        setFormData({ ...formData, input_fields: newFields });
                                                    }}
                                                    className="w-full h-10 bg-[#020617] border border-white/5 text-sm rounded-lg text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                                >
                                                    <option value="text">Text / String</option>
                                                    <option value="number">Number / Amount</option>
                                                    <option value="image">Image / Screenshot</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-500 uppercase">Placeholder</Label>
                                                <Input
                                                    value={field.placeholder}
                                                    onChange={(e) => {
                                                        const newFields = [...formData.input_fields];
                                                        newFields[idx].placeholder = e.target.value;
                                                        setFormData({ ...formData, input_fields: newFields });
                                                    }}
                                                    placeholder="Help text for user..."
                                                    className="h-10 bg-[#020617] border-white/5 text-sm text-white focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 pt-6">
                                                <Switch
                                                    checked={field.required}
                                                    onCheckedChange={(checked) => {
                                                        const newFields = [...formData.input_fields];
                                                        newFields[idx].required = checked;
                                                        setFormData({ ...formData, input_fields: newFields });
                                                    }}
                                                />
                                                <Label className="text-[10px] font-black text-gray-500 uppercase cursor-pointer">Required Field</Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {formData.input_fields.length === 0 && (
                                    <div className="text-center py-8 bg-white/5 rounded-[1.5rem] border border-dashed border-white/10">
                                        <p className="text-xs text-gray-600 font-medium italic">No custom fields added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="p-8 border-t border-white/5 bg-[#0b1021] shrink-0">
                        <Button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-500 text-white w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                        >
                            {editingMethod ? "Save Changes" : "Create Payment Method"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0b1021] border-white/5 rounded-[2rem] p-8 max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-white">Delete Method?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the payment method and remove it from the dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="bg-white/5 border-white/5 text-white hover:bg-white/10 rounded-xl h-12 flex-1 font-bold">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-400 text-white rounded-xl h-12 flex-1 font-bold"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

function SortableMethodCard({ method, handleOpenDialog, handleDelete }: { method: any, handleOpenDialog: any, handleDelete: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: method.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card
                className={cn(
                    "bg-white/5 border-white/5 backdrop-blur-sm overflow-hidden transition-shadow duration-200",
                    isDragging ? "shadow-2xl ring-2 ring-blue-500/50" : ""
                )}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div
                            {...attributes}
                            {...listeners}
                            className="p-1 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 focus:outline-none"
                        >
                            <GripVertical size={20} />
                        </div>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-white">{method.name}</CardTitle>
                            <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={method.is_active ? "default" : "destructive"} className={method.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}>
                            {method.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(method)}>
                            <Edit size={16} className="text-gray-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(method.id)}
                            className="hover:bg-red-500/10 hover:text-red-400"
                        >
                            <Trash2 size={16} className="text-gray-400" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Bonus</p>
                            <p className="text-emerald-400 font-bold">{method.bonus_percentage}%</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Currency</p>
                            <p className="text-blue-400 font-bold">{method.currency || 'USD'}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg col-span-1">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Available Input Fields</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(() => {
                                    try {
                                        const fields = typeof method.input_fields === 'string' ? JSON.parse(method.input_fields) : method.input_fields;
                                        return Array.isArray(fields) && fields.length > 0 ? (
                                            fields.map((f: any, i: number) => (
                                                <Badge key={i} variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">
                                                    {f.label} {f.required && <span className="text-red-400 ml-1">*</span>}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-600 italic">No custom fields</span>
                                        );
                                    } catch { return <span className="text-[10px] text-gray-600 italic">Error parsing fields</span>; }
                                })()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}