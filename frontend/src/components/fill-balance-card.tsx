"use client";

import { useState, useEffect } from "react"
import { Bitcoin, CreditCard, ChevronDown, Check, Sparkles, Upload, Image, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { TransactionHistory } from "@/components/transaction-history"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"



export function FillBalanceCard() {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  const apiUrl = `${backendUrl}/api`;

  const [activeTab, setActiveTab] = useState<"add" | "history">("add")
  const [methods, setMethods] = useState<any[]>([])
  const [selectedMethod, setSelectedMethod] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch(`${apiUrl}/payment-methods`)
        if (res.ok) {
          const data = await res.json()
          const formatted = data.map((m: any) => ({
            ...m,
            icon: m.type === 'crypto' ? Bitcoin : CreditCard,
            instructions: typeof m.instructions === 'string' ? JSON.parse(m.instructions) : m.instructions,
            input_fields: (() => {
              try {
                const fields = typeof m.input_fields === 'string' ? JSON.parse(m.input_fields) : m.input_fields;
                return Array.isArray(fields) ? fields : [];
              } catch { return []; }
            })(),
            bonus: `${m.bonus_percentage}%`,
            chargeFee: `${m.charge_fee_percentage || 0}%`
          }))
          setMethods(formatted)
          if (formatted.length > 0) setSelectedMethod(formatted[0])
        }
      } catch (err) {
        console.error("Failed to fetch payment methods", err)
      }
    }
    fetchMethods()
  }, [])

  useEffect(() => {
    setFieldValues({})
    setAmount("")
    setShowErrors(false)
  }, [selectedMethod])

  const handlePay = async () => {
    const cleanAmount = amount.trim()
    if (!cleanAmount || isNaN(parseFloat(cleanAmount)) || parseFloat(cleanAmount) <= 0) {
      setShowErrors(true)
      toast.error("Please enter a valid amount")
      return
    }

    // Check for required fields (if any marked as required in metadata)
    const missingFields = (selectedMethod.input_fields || []).filter((f: any) => {
      if (!f.required) return false
      const val = fieldValues[f.name]
      return !val || (typeof val === 'string' && !val.trim())
    })

    if (missingFields.length > 0) {
      setShowErrors(true)
      toast.error(`Please fill in: ${missingFields.map((f: any) => f.label).join(", ")}`)
      return
    }

    setIsSubmitting(true)
    try {
      // Collect all data
      const depositData = {
        methodId: selectedMethod.id,
        methodName: selectedMethod.name,
        amount: parseFloat(amount),
        bonus: parseFloat(bonusAmountStr),
        chargeFee: parseFloat(chargeFeeAmountStr),
        total: parseFloat(totalAmount),
        fields: fieldValues
      }

      console.log("Submitting deposit request:", depositData)
      const token = localStorage.getItem("nepo_token")

      const response = await fetch(`${apiUrl}/users/deposit-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(depositData)
      });

      if (!response.ok) throw new Error("Failed to submit request");

      toast.success("Deposit request submitted! Admin will verify it shortly.")
      setAmount("")
      setFieldValues({})
      setShowErrors(false)
    } catch (error) {
      toast.error("Failed to submit deposit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedMethod && activeTab === "add" && methods.length === 0) {
    // You might want a better loading state here
    return null
  }

  const getSymbol = (code: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'NPR': 'Rs.',
      'INR': '₹',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[code] || code || '$';
  };

  const currencySymbol = selectedMethod ? getSymbol(selectedMethod.currency) : '$';

  const rawAmount = amount ? parseFloat(amount) : 0;
  const chargeFeeAmountStr = amount ? (rawAmount * parseFloat(selectedMethod.chargeFee) / 100).toFixed(2) : "0.00";
  const chargeFeeVal = parseFloat(chargeFeeAmountStr);

  // Bonus is calculated on the Gross Amount (Charge does not affect bonus basis)
  const bonusAmountStr = amount ? (rawAmount * parseFloat(selectedMethod.bonus) / 100).toFixed(2) : "0.00";

  const totalAmount = (rawAmount + parseFloat(bonusAmountStr) - chargeFeeVal).toFixed(2);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold">Fill Balance</h2>
        </div>
        <div className="flex w-full sm:w-auto rounded-lg bg-secondary p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 sm:flex-none rounded-md px-4 text-sm",
              activeTab === "add" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={() => setActiveTab("add")}
          >
            Add funds
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 sm:flex-none rounded-md px-4 text-sm",
              activeTab === "history" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={() => setActiveTab("history")}
          >
            History
          </Button>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-6", activeTab === "add" ? "pt-6" : "pt-0")}>
        {activeTab === "add" ? (
          <>
            {/* Payment Method Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3 px-4 bg-secondary/50 border-border hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <selectedMethod.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedMethod.name}</span>
                        {selectedMethod.bonus_percentage > 0 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            {selectedMethod.bonus} Bonus
                          </span>
                        )}
                        {selectedMethod.charge_fee_percentage > 0 && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                            {selectedMethod.chargeFee} Fee
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{selectedMethod.description}</span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {methods.map((method) => (
                  <DropdownMenuItem
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <method.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.bonus_percentage > 0 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            {method.bonus} Bonus
                          </span>
                        )}
                        {method.charge_fee_percentage > 0 && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                            {method.chargeFee} Fee
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{method.description}</span>
                    </div>
                    {selectedMethod.id === method.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Instructions</Label>
              <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
                {selectedMethod.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{instruction}</span>
                  </div>
                ))}

                {selectedMethod.qr_code_url && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={selectedMethod.qr_code_url}
                      alt="Payment QR Code"
                      className="bg-white p-2 rounded-lg max-w-[350px] h-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Input Fields */}
            {selectedMethod.input_fields && selectedMethod.input_fields.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-primary/80 uppercase tracking-wider text-[10px]">Payment Details</Label>
                {selectedMethod.input_fields.map((field: any) => (
                  <div key={field.id || field.name} className="space-y-2">
                    <Label htmlFor={field.name} className={cn("text-sm font-medium", showErrors && field.required && !fieldValues[field.name] && "text-red-400")}>
                      {field.label} {field.required && <span className={cn("text-red-500 ml-0.5", showErrors && !fieldValues[field.name] && "animate-pulse")}>*</span>}
                    </Label>
                    {field.type === "image" ? (
                      <div className="space-y-3">
                        <div
                          className={cn(
                            "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center gap-2",
                            fieldValues[field.name]
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : showErrors && field.required && !fieldValues[field.name]
                                ? "!border-red-500 bg-red-500/5"
                                : "border-blue-500/50 bg-blue-500/5 hover:border-blue-500"
                          )}
                          onClick={() => document.getElementById(`file-${field.name}`)?.click()}
                        >
                          <input
                            type="file"
                            id={`file-${field.name}`}
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Set a temporary loading state for this specific field
                              setFieldValues(prev => ({ ...prev, [`${field.name}_loading`]: "true" }));

                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                const token = localStorage.getItem("nepo_token");
                                const response = await fetch(`${apiUrl}/upload`, {
                                  method: "POST",
                                  headers: {
                                    "Authorization": `Bearer ${token}`
                                  },
                                  body: formData
                                });
                                if (response.ok) {
                                  const data = await response.json();
                                  setFieldValues(prev => ({ ...prev, [field.name]: data.url }));
                                  toast.success(`${field.label} uploaded!`);
                                } else {
                                  toast.error("Upload failed");
                                }
                              } catch (err) {
                                toast.error("Upload failed");
                              } finally {
                                setFieldValues(prev => {
                                  const next = { ...prev };
                                  delete next[`${field.name}_loading`];
                                  return next;
                                });
                              }
                            }}
                          />

                          {fieldValues[`${field.name}_loading`] ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">Uploading...</p>
                            </div>
                          ) : fieldValues[field.name] ? (
                            <div className="relative w-full h-[180px] p-2 flex flex-col items-center justify-center">
                              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                                <Check size={10} strokeWidth={4} />
                                Successful
                              </div>
                              <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black/40 border border-white/5 relative group/img">
                                <img src={fieldValues[field.name]} alt="Preview" className="max-h-full max-w-full object-contain" />
                                <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl scale-90 group-hover/img:scale-100 transition-transform">
                                    Change Image
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform group-hover:bg-blue-500 group-hover:text-white">
                                <Image className="h-7 w-7" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-white uppercase tracking-tighter">Upload {field.label}</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={fieldValues[field.name] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValues(prev => ({ ...prev, [field.name]: val }));
                          if (field.name === 'amount') setAmount(val);
                        }}
                        className={cn(
                          "h-12 bg-secondary/50 transition-all",
                          showErrors && (
                            (field.required && (!fieldValues[field.name] || (typeof fieldValues[field.name] === 'string' && !fieldValues[field.name].trim()))) ||
                            (field.name === 'amount' && (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0))
                          )
                            ? "border-2 border-red-500 bg-red-500/5 ring-1 ring-red-500 focus-visible:ring-red-500"
                            : "border border-border"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bonus and Fee Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="space-y-2">
                {selectedMethod.bonus_percentage > 0 && (
                  <div className="flex items-center justify-between text-sm px-1">
                    <span className="text-muted-foreground">Bonus ({selectedMethod.bonus})</span>
                    <span className="text-emerald-400 font-medium">+{currencySymbol}{bonusAmountStr}</span>
                  </div>
                )}
                {selectedMethod.charge_fee_percentage > 0 && (
                  <div className="flex items-center justify-between text-sm px-1">
                    <span className="text-muted-foreground">Charge Fee ({selectedMethod.chargeFee})</span>
                    <span className="text-red-400 font-medium">-{currencySymbol}{chargeFeeAmountStr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total and Pay Button */}
            {amount && parseFloat(amount) > 0 && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-primary">{currencySymbol}{totalAmount}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full h-12 text-base font-semibold"
              size="lg"
              disabled={isSubmitting}
              onClick={handlePay}
            >
              {isSubmitting ? "Checking..." : "Check"}
            </Button>
          </>
        ) : (
          <TransactionHistory />
        )}
      </CardContent>
    </Card>
  )
}