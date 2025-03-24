import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from './supabaseClient'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format date to US format
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return new Intl.DateTimeFormat("en-US", options).format(date)
}

// Function to format time to US format
export function formatTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }

  return new Intl.DateTimeFormat("en-US", options).format(date)
}

// Function to format currency to US format
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Function to save data to Supabase
export async function saveToSupabase(table: string, data: any): Promise<any> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
  
  if (error) {
    console.error(`Error saving to ${table}:`, error)
    return null
  }
  
  return result
}

// Function to update data in Supabase
export async function updateInSupabase(table: string, id: string, data: any): Promise<any> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error(`Error updating in ${table}:`, error)
    return null
  }
  
  return result
}

// Function to delete data from Supabase
export async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error(`Error deleting from ${table}:`, error)
    return false
  }
  
  return true
}

// Function to fetch data from Supabase
export async function fetchFromSupabase(table: string): Promise<any[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    return []
  }
  
  return data || []
}

// Legacy functions for backward compatibility
// Function to save data to localStorage
export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

// Function to get data from localStorage
export function getFromLocalStorage(key: string): any {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  return null
}