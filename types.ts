export enum View {
  Dashboard = 'Dashboard',
  Billing = 'Lista de Facturas',
  CreateInvoice = 'Crear Factura',
  Products = 'Productos',
  Inventory = 'Inventario',
  Customers = 'Clientes',
  Suppliers = 'Suplidores',
  Purchases = 'Compras y Gastos',
  Users = 'Usuarios',
  Reports = 'Reportes',
  Settings = 'Configuración',
}

export enum InvoiceStatus {
  Paid = 'Pagada',
  Pending = 'Pendiente',
  Cancelled = 'Anulada',
  Quote = 'Cotización',
}

export enum UserRole {
  Admin = 'Administrador',
  Sales = 'Vendedor',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  hasItbis: boolean;
}

export interface Customer {
  id: string;
  name: string;
  rnc: string;
  phone: string;
  email: string;
  address: string;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
  hasItbis: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  ncf: string;
  customerId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  itbis: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod: string;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface CompanyInfo {
    name: string;
    rnc: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string; // URL or base64 string of the logo
}

export interface NCFSequence {
    id: string;
    prefix: string;
    description: string;
    initialSequence: number;
    finalSequence: number;
    currentSequence: number;
    active: boolean;
}

export interface AppSettings {
    companyInfo: CompanyInfo;
    itbisRate: number; // e.g., 18 for 18%
    invoiceFooter: string;
    currencySymbol: string;
    ncfSequences: NCFSequence[];
}

export interface Supplier {
  id: string;
  name: string;
  rnc: string;
  phone: string;
  address: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  cost: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  invoiceNumber: string;
  ncf: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  itbis: number;
  total: number;
  status: 'Recibida' | 'Pendiente';
  paymentStatus: 'Pagada' | 'Pendiente';
}

export enum ExpenseCategory {
    Rent = 'Alquiler',
    Services = 'Servicios',
    Salaries = 'Salarios',
    Marketing = 'Marketing',
    Other = 'Otros',
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
}

export enum InventoryMovementType {
    Purchase = 'Compra',
    Sale = 'Venta',
    Entry = 'Entrada Manual',
    Exit = 'Salida Manual',
    Adjustment = 'Ajuste',
}

export interface InventoryMovement {
    id:string;
    productId: string;
    date: string;
    type: InventoryMovementType;
    quantity: number; // Positive for additions, negative for subtractions
    reason: string;
    relatedId?: string; // e.g., purchaseId or invoiceId
}