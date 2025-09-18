
import React, { useState, ChangeEvent, FormEvent, useMemo, useEffect, KeyboardEvent } from 'react';
import { 
    View, Invoice, Product, Customer, User, InvoiceStatus, UserRole, AppSettings, 
    Supplier, Purchase, Expense, ExpenseCategory, PurchaseItem, InventoryMovement, InventoryMovementType, InvoiceItem, NCFSequence
} from './types';
import { 
  DashboardIcon, BillingIcon, ProductIcon, InventoryIcon, CustomerIcon, 
  SupplierIcon, PurchasesIcon, UsersIcon, ReportsIcon, SettingsIcon, LogoutIcon,
  BuildingOfficeIcon, ReceiptPercentIcon, DocumentTextIcon, DatabaseIcon, PuzzlePieceIcon, UploadIcon,
  ChartBarIcon, BanknotesIcon, ScaleIcon, PlusIcon, TrashIcon, PencilIcon, TicketIcon, BarcodeIcon,
  ArrowUpTrayIcon, ArrowDownTrayIcon, WrenchScrewdriverIcon, ArrowPathIcon,
  PrinterIcon, DocumentArrowDownIcon, ShoppingCartIcon, ChevronLeftIcon, SparklesIcon, MagnifyingGlassIcon, CreditCardIcon, XIcon as CloseIcon, CalendarDaysIcon
} from './components/Icons';
import Modal from './components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';

// --- MOCK DATA ---
const initialProducts: Product[] = [
  { id: 'p1', name: 'Laptop Pro 15"', sku: 'LP15-001', barcode: '8412345678905', description: 'Potente laptop para profesionales', price: 1500, cost: 900, stock: 50, category: 'Electrónica', hasItbis: true },
  { id: 'p2', name: 'Mouse Inalámbrico', sku: 'MI-002', barcode: '8412345678912', description: 'Mouse ergonómico y preciso', price: 40, cost: 15, stock: 200, category: 'Accesorios', hasItbis: true },
  { id: 'p3', name: 'Teclado Mecánico RGB', sku: 'TM-003', barcode: '8412345678929', description: 'Teclado para gaming y productividad', price: 120, cost: 65, stock: 120, category: 'Accesorios', hasItbis: true },
  { id: 'p4', name: 'Monitor Ultrawide 34"', sku: 'MU34-001', barcode: '8412345678936', description: 'Monitor curvo para inmersión total', price: 800, cost: 550, stock: 30, category: 'Monitores', hasItbis: true },
  { id: 'p5', name: 'Silla Ergonómica Pro', sku: 'SE-005', barcode: '8412345678943', description: 'Comodidad para largas jornadas', price: 350, cost: 180, stock: 80, category: 'Muebles', hasItbis: true },
  { id: 'p6', name: 'Webcam 4K', sku: 'WC4K-001', barcode: '8412345678950', description: 'Calidad de video profesional', price: 199, cost: 110, stock: 0, category: 'Accesorios', hasItbis: true },
  { id: 'p7', name: 'Libro de Contabilidad', sku: 'LIB-001', barcode: '9780134729115', description: 'Guía para contadores profesionales', price: 50, cost: 20, stock: 100, category: 'Libros', hasItbis: false },
];

const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Tech Solutions SRL', rnc: '130123456', phone: '809-555-1234', email: 'contacto@techsolutions.com', address: 'Av. Winston Churchill #1020' },
  { id: 'c2', name: 'Juan Pérez', rnc: '00112345678', phone: '829-555-5678', email: 'juan.perez@email.com', address: 'Calle Falsa 123' },
];

const initialInvoices: Invoice[] = [
  { id: 'f1', invoiceNumber: 'F-1001', ncf: 'B0100000001', customerId: 'c1', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0], items: [{ productId: 'p1', quantity: 2, price: 1500, hasItbis: true }], subtotal: 3000, itbis: 540, total: 3540, status: InvoiceStatus.Paid, paymentMethod: 'Transferencia', userId: 'u2' },
  { id: 'f2', invoiceNumber: 'F-1002', ncf: 'B0100000002', customerId: 'c2', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], items: [{ productId: 'p2', quantity: 5, price: 40, hasItbis: true }, { productId: 'p3', quantity: 1, price: 120, hasItbis: true }], subtotal: 320, itbis: 57.6, total: 377.6, status: InvoiceStatus.Pending, paymentMethod: 'Efectivo', userId: 'u2' },
  { id: 'f3', invoiceNumber: 'F-1004', ncf: 'B0100000003', customerId: 'c1', date: new Date().toISOString().split('T')[0], items: [{ productId: 'p3', quantity: 10, price: 120, hasItbis: true }], subtotal: 1200, itbis: 216, total: 1416, status: InvoiceStatus.Paid, paymentMethod: 'Crédito', userId: 'u2' },
  { id: 'f4', invoiceNumber: 'F-1003', ncf: 'B0100000004', customerId: 'c2', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], items: [{ productId: 'p1', quantity: 1, price: 1500, hasItbis: true }], subtotal: 1500, itbis: 270, total: 1770, status: InvoiceStatus.Pending, paymentMethod: 'Efectivo', userId: 'u2' },
];

const initialUsers: User[] = [
    { id: 'u1', name: 'Admin General', username: 'admin', email: 'admin@empresa.com', role: UserRole.Admin, active: true },
    { id: 'u2', name: 'Vendedor Estrella', username: 'vendedor1', email: 'vendedor1@empresa.com', role: UserRole.Sales, active: true },
];

const initialSuppliers: Supplier[] = [
    { id: 's1', name: 'ElectroDistribuidores S.A.', rnc: '130987654', phone: '809-555-8888', address: 'Parque Industrial Duarte' },
    { id: 's2', name: 'OficinaTodo SRL', rnc: '130112233', phone: '809-555-9999', address: 'Plaza Central, 2do Nivel' },
];

const initialPurchases: Purchase[] = [
    { id: 'pc1', supplierId: 's1', invoiceNumber: 'INV-S1-001', ncf: 'B0200000101', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0], items: [{productId: 'p1', quantity: 10, cost: 890}], subtotal: 7542.37, itbis: 1357.63, total: 8900, status: 'Recibida', paymentStatus: 'Pagada' },
    { id: 'pc2', supplierId: 's2', invoiceNumber: 'INV-S2-005', ncf: 'B0200000102', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0], items: [{productId: 'p2', quantity: 50, cost: 14}, {productId: 'p3', quantity: 20, cost: 60}], subtotal: 1610.17, itbis: 289.83, total: 1900, status: 'Recibida', paymentStatus: 'Pendiente' },
    { id: 'pc3', supplierId: 's1', invoiceNumber: 'INV-S1-002', ncf: 'B0200000103', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0], items: [{productId: 'p1', quantity: 5, cost: 900}], subtotal: 3813.56, itbis: 686.44, total: 4500, status: 'Recibida', paymentStatus: 'Pendiente' },
];

const initialExpenses: Expense[] = [
    { id: 'e1', description: 'Pago de alquiler', amount: 1200, date: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString().split('T')[0], category: ExpenseCategory.Rent },
    { id: 'e2', description: 'Factura de electricidad', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], category: ExpenseCategory.Services },
];

const initialAppSettings: AppSettings = {
  companyInfo: {
    name: 'Mi Empresa SRL',
    rnc: '130000000',
    address: 'Avenida Principal 123, Santo Domingo',
    phone: '809-555-1234',
    email: 'info@miempresa.com',
    website: 'www.miempresa.com',
    logo: ''
  },
  itbisRate: 18,
  invoiceFooter: 'Gracias por su compra. Esta es una factura generada por InvoSys.',
  currencySymbol: 'RD$',
  ncfSequences: [
      { id: 'ncf1', prefix: 'B01', description: 'Factura de Consumo', initialSequence: 1, finalSequence: 1000, currentSequence: 5, active: true },
      { id: 'ncf2', prefix: 'B14', description: 'Nota de Crédito', initialSequence: 1, finalSequence: 500, currentSequence: 1, active: true },
  ],
};

const salesAllowedViews: View[] = [
    View.Dashboard,
    View.CreateInvoice,
    View.Billing,
    View.Products,
    View.Inventory,
    View.Customers,
    View.Reports,
];

// --- DUMMY COMPONENTS FOR UNIMPLEMENTED VIEWS ---
const ComingSoonView: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-dark mb-4">{title}</h1>
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <h2 className="text-2xl text-gray-700">Próximamente...</h2>
            <p className="text-gray-500 mt-2">Esta sección está en construcción. ¡Vuelve pronto!</p>
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettings);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  useEffect(() => {
    const initialMovements: InventoryMovement[] = [];
    let movId = 1;

    // From purchases
    initialPurchases.forEach(purchase => {
        purchase.items.forEach(item => {
            initialMovements.push({
                id: `mov-${movId++}`,
                productId: item.productId,
                date: purchase.date,
                type: InventoryMovementType.Purchase,
                quantity: item.quantity,
                reason: `Compra a ${initialSuppliers.find(s => s.id === purchase.supplierId)?.name || 'N/A'}`,
                relatedId: purchase.id,
            });
        });
    });

    // From invoices (sales)
    initialInvoices.forEach(invoice => {
        if (invoice.status !== InvoiceStatus.Cancelled && invoice.status !== InvoiceStatus.Quote) {
            invoice.items.forEach(item => {
                initialMovements.push({
                    id: `mov-${movId++}`,
                    productId: item.productId,
                    date: invoice.date,
                    type: InventoryMovementType.Sale,
                    quantity: -item.quantity, // Negative for sales
                    reason: `Venta a ${initialCustomers.find(c => c.id === invoice.customerId)?.name || 'N/A'}`,
                    relatedId: invoice.id,
                });
            });
        }
    });

    // Sort by date descending
    initialMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setInventoryMovements(initialMovements);

  }, []);
  
    useEffect(() => {
        if (currentUser?.role === UserRole.Sales && !salesAllowedViews.includes(activeView)) {
            setActiveView(View.Dashboard);
        }
    }, [activeView, currentUser]);

  const addInventoryMovement = (movement: Omit<InventoryMovement, 'id' | 'date'>) => {
    const newMovement: InventoryMovement = {
        id: `mov-${inventoryMovements.length + Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...movement,
    };
    setInventoryMovements(prev => [newMovement, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
    
  const getNextInvoiceNumber = (isQuote: boolean): string => {
      const prefix = isQuote ? 'C-' : 'F-';
      const relevantInvoices = invoices.filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix));
      if (relevantInvoices.length === 0) {
          return `${prefix}1001`;
      }
      const maxNumber = Math.max(...relevantInvoices.map(inv => parseInt(inv.invoiceNumber.split('-')[1] || "0", 10)));
      return `${prefix}${maxNumber + 1}`;
  };

  const handleCreateInvoice = (invoiceData: { customerId: string; items: InvoiceItem[]; paymentMethod: string; }) => {
    const { customerId, items, paymentMethod } = invoiceData;

    const activeNcf = appSettings.ncfSequences.find(s => s.prefix === 'B01' && s.active); // Prefijo para Factura de Consumo

    if (!activeNcf || activeNcf.currentSequence > activeNcf.finalSequence) {
        alert("Error: No hay una secuencia de NCF de consumo (B01) activa o se ha agotado. Por favor, configure una en los ajustes.");
        return;
    }

    const nextNcfNumber = activeNcf.currentSequence;
    const ncfString = `${activeNcf.prefix}${String(nextNcfNumber).padStart(8, '0')}`;
    
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableSubtotal = items.filter(item => item.hasItbis).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itbis = taxableSubtotal * (appSettings.itbisRate / 100);
    const total = subtotal + itbis;

    const newInvoice: Invoice = {
        id: `f${invoices.length + Date.now()}`,
        invoiceNumber: getNextInvoiceNumber(false),
        ncf: ncfString,
        customerId,
        date: new Date().toISOString().split('T')[0],
        items,
        subtotal,
        itbis,
        total,
        status: paymentMethod === 'Crédito' ? InvoiceStatus.Pending : InvoiceStatus.Paid,
        paymentMethod,
        userId: currentUser?.id,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    
    // Update NCF sequence in settings
    setAppSettings(prevSettings => {
        const newNcfSequences = prevSettings.ncfSequences.map(seq => 
            seq.id === activeNcf.id 
                ? { ...seq, currentSequence: seq.currentSequence + 1 } 
                : seq
        );
        return { ...prevSettings, ncfSequences: newNcfSequences };
    });

    // Update product stock and inventory movements
    setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        newInvoice.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex].stock -= item.quantity;
            }
            addInventoryMovement({
                productId: item.productId,
                type: InventoryMovementType.Sale,
                quantity: -item.quantity,
                reason: `Venta Factura #${newInvoice.ncf}`,
                relatedId: newInvoice.id,
            });
        });
        return updatedProducts;
    });

    setActiveView(View.Billing); // Go back to the list after creation
  };

  const handleCreateQuote = (quoteData: { customerId: string; items: InvoiceItem[]; }) => {
    const { customerId, items } = quoteData;
    
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableSubtotal = items.filter(item => item.hasItbis).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itbis = taxableSubtotal * (appSettings.itbisRate / 100);
    const total = subtotal + itbis;

    const newQuote: Invoice = {
        id: `qt${invoices.length + Date.now()}`,
        invoiceNumber: getNextInvoiceNumber(true),
        ncf: 'COTIZACION',
        customerId,
        date: new Date().toISOString().split('T')[0],
        items,
        subtotal,
        itbis,
        total,
        status: InvoiceStatus.Quote,
        paymentMethod: 'N/A',
        userId: currentUser?.id,
    };

    setInvoices(prev => [newQuote, ...prev]);
    setActiveView(View.Billing); // Go back to the list after creation
  };


  const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: InvoiceStatus) => {
    setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
            invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
        )
    );
  };


  const handleStockMovement = (productId: string, quantity: number, type: InventoryMovementType.Entry | InventoryMovementType.Exit, reason: string) => {
      setProducts(prevProducts => prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock + quantity } : p
      ));
      addInventoryMovement({ productId, quantity, type, reason });
  };

  const handleStockAdjustment = (productId: string, newStock: number, reason: string) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const quantityChange = newStock - product.stock;
      if (quantityChange === 0) return;

      setProducts(prevProducts => prevProducts.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
      ));
      addInventoryMovement({ 
          productId, 
          quantity: quantityChange, 
          type: InventoryMovementType.Adjustment, 
          reason 
      });
  };

  const handleCreatePurchase = (purchase: Omit<Purchase, 'id' | 'total' | 'subtotal' | 'itbis'>) => {
    const total = purchase.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const subtotal = total / (1 + appSettings.itbisRate / 100);
    const itbis = total - subtotal;
    const newPurchase: Purchase = {
        id: `pc${purchases.length + 1}`,
        ...purchase,
        subtotal,
        itbis,
        total,
    };
    setPurchases(prev => [newPurchase, ...prev]);

    setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        newPurchase.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex].stock += item.quantity;
            }
            addInventoryMovement({
                productId: item.productId,
                type: InventoryMovementType.Purchase,
                quantity: item.quantity,
                reason: `Compra a ${suppliers.find(s => s.id === newPurchase.supplierId)?.name || 'N/A'}`,
                relatedId: newPurchase.id,
            });
        });
        return updatedProducts;
    });
  };

  const handleCreateExpense = (expense: Omit<Expense, 'id'>) => {
      const newExpense: Expense = {
          id: `e${expenses.length + 1}`,
          ...expense
      };
      setExpenses(prev => [newExpense, ...prev]);
  };
  
  const handleCreateSupplier = (supplierData: Omit<Supplier, 'id'>) => {
      const newSupplier: Supplier = {
          id: `s${suppliers.length + 1}`,
          ...supplierData
      };
      setSuppliers(prev => [newSupplier, ...prev]);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
      setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };

  const handleDeleteSupplier = (supplierId: string) => {
      if(window.confirm('¿Está seguro de que desea eliminar este suplidor?')) {
          setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      }
  };
    
    const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            id: `p${products.length + Date.now()}`,
            ...productData
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const handleDeleteProduct = (productId: string) => {
        const isUsedInInvoice = invoices.some(inv => inv.items.some(item => item.productId === productId));
        const isUsedInPurchase = purchases.some(p => p.items.some(item => item.productId === productId));
        const isUsedInMovements = inventoryMovements.some(m => m.productId === productId);

        if (isUsedInInvoice || isUsedInPurchase || isUsedInMovements) {
            alert("Este producto no se puede eliminar porque tiene historial de transacciones (facturas, compras o movimientos de inventario). Considere poner su stock en 0 si ya no desea venderlo.");
            return;
        }

        if(window.confirm('¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };
    
    const handleCreateCustomer = (customerData: Omit<Customer, 'id'>) => {
        const newCustomer: Customer = {
            id: `c${customers.length + Date.now()}`,
            ...customerData
        };
        setCustomers(prev => [newCustomer, ...prev]);
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const handleDeleteCustomer = (customerId: string) => {
        if(window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            setCustomers(prev => prev.filter(c => c.id !== customerId));
        }
    };

    const handleCreateUser = (userData: Omit<User, 'id'>): boolean => {
        if (userData.role === UserRole.Admin && users.some(u => u.role === UserRole.Admin)) {
            console.error("Attempted to create a second administrator.");
            return false;
        }
        const newUser: User = {
            id: `u${users.length + Date.now()}`,
            ...userData
        };
        setUsers(prev => [newUser, ...prev]);
        return true;
    };

    const handleUpdateUser = (updatedUser: User) => {
         if (updatedUser.role === UserRole.Admin) {
            const otherAdminExists = users.some(u => u.role === UserRole.Admin && u.id !== updatedUser.id);
            if (otherAdminExists) {
                alert('Ya existe un usuario Administrador. Solo se permite uno.');
                return;
            }
        }
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleDeleteUser = (userId: string) => {
        if(window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };


    const handleExportData = () => {
        const dataToExport = {
            products,
            customers,
            invoices,
            users,
            suppliers,
            purchases,
            expenses,
            appSettings,
            inventoryMovements,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `invosys_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not valid text");
                const data = JSON.parse(text);
                
                if (window.confirm("¿Está seguro de que desea importar estos datos? Se sobrescribirá toda la información actual.")) {
                    setProducts(data.products || initialProducts);
                    setCustomers(data.customers || initialCustomers);
                    setInvoices(data.invoices || initialInvoices);
                    setUsers(data.users || initialUsers);
                    setSuppliers(data.suppliers || initialSuppliers);
                    setPurchases(data.purchases || initialPurchases);
                    setExpenses(data.expenses || initialExpenses);
                    setAppSettings(data.appSettings || initialAppSettings);
                    setInventoryMovements(data.inventoryMovements || []);
                    alert("Datos importados correctamente.");
                }
            } catch (error) {
                console.error("Error parsing backup file:", error);
                alert("Error al importar el archivo. Asegúrese de que sea un archivo de copia de seguridad válido.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleLogin = (usernameOrEmail: string, password: string): boolean => {
        const user = users.find(u => (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && u.active);
        // NOTE: In a real app, password would be hashed and checked on a server.
        // For this demo, we'll just check if the user exists and is active. A non-empty password is required.
        if (user && password) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
    };


  const renderView = () => {
    if (currentUser?.role === UserRole.Sales && !salesAllowedViews.includes(activeView)) {
        const userInvoices = invoices.filter(inv => inv.userId === currentUser.id);
        return <DashboardView invoices={userInvoices} products={products} customers={customers} users={users} currentUser={currentUser} />;
    }
    
    const userInvoices = currentUser?.role === UserRole.Sales ? invoices.filter(inv => inv.userId === currentUser.id) : invoices;

    switch (activeView) {
      case View.Dashboard:
        return <DashboardView invoices={userInvoices} products={products} customers={customers} users={users} currentUser={currentUser} />;
      case View.Billing:
        return <BillingView 
                    invoices={userInvoices} 
                    customers={customers}
                    products={products}
                    settings={appSettings}
                    setActiveView={setActiveView}
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                    users={users}
                    currentUser={currentUser}
                />;
       case View.CreateInvoice:
        return <CreateInvoiceView 
            products={products} 
            customers={customers}
            settings={appSettings}
            onCreateInvoice={handleCreateInvoice} 
            onCreateQuote={handleCreateQuote}
            onBack={() => setActiveView(View.Billing)} 
        />;
      case View.Products:
        return <ProductsView 
                    products={products}
                    onCreate={handleCreateProduct}
                    onUpdate={handleUpdateProduct}
                    onDelete={handleDeleteProduct}
                    currentUser={currentUser}
                />;
      case View.Customers:
        return <CustomersView
                  customers={customers}
                  onCreate={handleCreateCustomer}
                  onUpdate={handleUpdateCustomer}
                  onDelete={handleDeleteCustomer}
              />;
      case View.Users:
        return <UsersView
            users={users}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
        />;
      case View.Inventory:
        return <InventoryView 
                  products={products}
                  inventoryMovements={inventoryMovements}
                  onStockMovement={handleStockMovement}
                  onStockAdjustment={handleStockAdjustment}
                  currentUser={currentUser}
               />;
      case View.Suppliers:
        return <SuppliersView 
                    suppliers={suppliers} 
                    purchases={purchases}
                    onCreate={handleCreateSupplier}
                    onUpdate={handleUpdateSupplier}
                    onDelete={handleDeleteSupplier}
                />;
      case View.Purchases:
        return <PurchasesView
            purchases={purchases}
            expenses={expenses}
            suppliers={suppliers}
            products={products}
            onCreatePurchase={handleCreatePurchase}
            onCreateExpense={handleCreateExpense}
        />;
      case View.Reports:
        return <ReportsView 
                  invoices={userInvoices} 
                  customers={customers} 
                  products={products}
                  purchases={purchases}
                  suppliers={suppliers}
                  settings={appSettings}
                  currentUser={currentUser} 
               />;
      case View.Settings:
        return <SettingsView 
                    settings={appSettings} 
                    setSettings={setAppSettings} 
                    onExport={handleExportData}
                    onImport={handleImportData}
                />;
      default:
        return <DashboardView invoices={userInvoices} products={products} customers={customers} users={users} currentUser={currentUser} />;
    }
  };
  
  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} onCreateUser={handleCreateUser} users={users} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} currentUser={currentUser} />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

// --- SIDEBAR COMPONENT ---
interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, currentUser }) => {
    const allNavItems = [
        { view: View.Dashboard, icon: DashboardIcon, label: 'Dashboard' },
        { view: View.CreateInvoice, icon: ShoppingCartIcon, label: 'Venta Rápida' },
        { view: View.Billing, icon: BillingIcon, label: 'Lista de Facturas' },
        { view: View.Products, icon: ProductIcon, label: 'Productos' },
        { view: View.Inventory, icon: InventoryIcon, label: 'Inventario' },
        { view: View.Customers, icon: CustomerIcon, label: 'Clientes' },
        { view: View.Suppliers, icon: SupplierIcon, label: 'Suplidores' },
        { view: View.Purchases, icon: PurchasesIcon, label: 'Compras' },
        { view: View.Users, icon: UsersIcon, label: 'Usuarios' },
        { view: View.Reports, icon: ReportsIcon, label: 'Reportes' },
        { view: View.Settings, icon: SettingsIcon, label: 'Configuración' },
    ];

    const navItems = currentUser?.role === UserRole.Admin
        ? allNavItems
        : allNavItems.filter(item => salesAllowedViews.includes(item.view));

    return (
        <aside className="w-64 bg-dark text-gray-300 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white text-center">InvoSys</h2>
            </div>
            <nav className="flex-1 p-2 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setActiveView(item.view)}
                        className={`w-full flex items-center px-4 py-2.5 text-sm rounded-md transition-colors ${
                            activeView === item.view
                                ? 'bg-primary text-white'
                                : 'hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
             <div className="mt-auto p-4 border-t border-gray-700">
                <p className="text-sm text-center text-gray-400">Logueado como:</p>
                <p className="text-md font-semibold text-center text-white truncate">{currentUser?.name}</p>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center mt-4 px-4 py-2.5 text-sm rounded-md transition-colors bg-red-500/20 text-red-300 hover:bg-red-500/40 hover:text-white"
                >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

// --- AUTH VIEW & COMPONENTS ---

// LoginForm Component
const LoginForm: React.FC<{
    onLogin: (u: string, p: string) => boolean;
    setMode: (mode: 'register' | 'forgot') => void;
}> = ({ onLogin, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!onLogin(username, password)) {
            setError('Credenciales incorrectas o usuario inactivo.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario o Email</label>
                <div className="mt-1">
                    <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="mt-1">
                    <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm">
                    <button type="button" onClick={() => setMode('forgot')} className="font-medium text-primary hover:text-primary/80">¿Olvidaste tu contraseña?</button>
                </div>
            </div>
            <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Iniciar Sesión
                </button>
            </div>
            <div className="text-sm text-center">
                <p className="text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <button type="button" onClick={() => setMode('register')} className="font-medium text-primary hover:text-primary/80">Regístrate</button>
                </p>
            </div>
        </form>
    );
};

// RegisterForm Component
const RegisterForm: React.FC<{
    onCreateUser: (data: Omit<User, 'id'>) => boolean;
    users: User[];
    setMode: (mode: 'login') => void;
}> = ({ onCreateUser, users, setMode }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        username: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        role: UserRole.Sales,
    });
    const [error, setError] = useState('');
    const adminExists = users.some(u => u.role === UserRole.Admin);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
            setError('El nombre de usuario ya existe.');
            return;
        }
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('El correo electrónico ya está en uso.');
            return;
        }
        
        const success = onCreateUser({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role as UserRole,
            active: true,
        });

        if (success) {
            alert('¡Registro exitoso! Por favor, inicia sesión.');
            setMode('login');
        } else {
            setError('Ocurrió un error. Es posible que el usuario/email ya exista, o que no se pueda crear otro Administrador.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                <input name="username" type="text" required value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white">
                    <option value={UserRole.Sales}>Vendedor</option>
                    <option value={UserRole.Admin} disabled={adminExists}>
                        Administrador {adminExists ? '(Ya existe uno)' : ''}
                    </option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none">
                    Registrarse
                </button>
            </div>
            <div className="text-sm text-center">
                <p className="text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <button type="button" onClick={() => setMode('login')} className="font-medium text-primary hover:text-primary/80">Inicia Sesión</button>
                </p>
            </div>
        </form>
    );
};

// ForgotPasswordForm Component
const ForgotPasswordForm: React.FC<{
    setMode: (mode: 'login') => void;
}> = ({ setMode }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Simulate sending an email
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="text-center space-y-4">
                <p className="text-sm text-gray-700">Si existe una cuenta con el correo electrónico <strong>{email}</strong>, se ha enviado un enlace para restablecer la contraseña.</p>
                <button onClick={() => setMode('login')} className="font-medium text-primary hover:text-primary/80">Volver a Iniciar Sesión</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <div className="mt-1">
                    <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none">
                    Enviar Enlace de Recuperación
                </button>
            </div>
            <div className="text-sm text-center">
                <button type="button" onClick={() => setMode('login')} className="font-medium text-primary hover:text-primary/80">Volver a Iniciar Sesión</button>
            </div>
        </form>
    );
};

// AuthView Main Component
const AuthView: React.FC<{
    onLogin: (u: string, p: string) => boolean;
    onCreateUser: (data: Omit<User, 'id'>) => boolean;
    users: User[];
}> = ({ onLogin, onCreateUser, users }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

    const renderForm = () => {
        switch(mode) {
            case 'login': return <LoginForm onLogin={onLogin} setMode={setMode} />;
            case 'register': return <RegisterForm onCreateUser={onCreateUser} users={users} setMode={setMode} />;
            case 'forgot': return <ForgotPasswordForm setMode={setMode} />;
            default: return <LoginForm onLogin={onLogin} setMode={setMode} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">
                    InvoSys
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {mode === 'login' && 'Inicia sesión en tu cuenta'}
                    {mode === 'register' && 'Crea una nueva cuenta'}
                    {mode === 'forgot' && 'Recupera tu contraseña'}
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
}

// --- DASHBOARD VIEW ---
interface DashboardProps {
    invoices: Invoice[];
    products: Product[];
    customers: Customer[];
    users: User[];
    currentUser: User | null;
}
const DashboardView: React.FC<DashboardProps> = ({ invoices, products, customers, users, currentUser }) => {
    const totalSales = invoices.reduce((sum, inv) => (inv.status !== InvoiceStatus.Cancelled && inv.status !== InvoiceStatus.Quote) ? sum + inv.total : sum, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Pending).length;

    const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-primary/20 text-primary p-3 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-dark">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={currentUser?.role === UserRole.Sales ? "Mis Ventas" : "Ventas Totales"} value={`$${totalSales.toFixed(2)}`} icon={<BillingIcon className="w-6 h-6"/>} />
                <StatCard title="Facturas Pendientes" value={String(pendingInvoices)} icon={<ReportsIcon className="w-6 h-6"/>} />
                <StatCard title="Total de Clientes" value={String(customers.length)} icon={<CustomerIcon className="w-6 h-6"/>} />
                <StatCard title="Productos en Catálogo" value={String(products.length)} icon={<ProductIcon className="w-6 h-6"/>} />
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-dark mb-4">Facturas Recientes</h2>
                <InvoiceTable invoices={invoices.slice(0, 5)} customers={customers} users={users} />
            </div>
        </div>
    );
};

// --- BILLING VIEW ---
interface BillingProps {
    invoices: Invoice[];
    customers: Customer[];
    products: Product[];
    settings: AppSettings;
    setActiveView: (view: View) => void;
    onUpdateInvoiceStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
    users: User[];
    currentUser: User | null;
}
const BillingView: React.FC<BillingProps> = ({ invoices, customers, products, settings, setActiveView, onUpdateInvoiceStatus, users, currentUser }) => {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [detailViewMode, setDetailViewMode] = useState<'detail' | 'ticket'>('detail');

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const handleRowClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailViewMode('detail'); // Reset to default view when a new invoice is selected
    };

    if (selectedInvoice) {
        const customer = customerMap.get(selectedInvoice.customerId);
        if (!customer) {
            console.error("Customer not found for invoice:", selectedInvoice);
            setSelectedInvoice(null);
            return null;
        }

        if (detailViewMode === 'ticket') {
            return (
                <TicketPrintView
                    invoice={selectedInvoice}
                    customer={customer}
                    productMap={productMap}
                    settings={settings}
                    onBack={() => setDetailViewMode('detail')}
                    users={users}
                />
            );
        }

        return (
            <InvoiceDetailView 
                invoice={selectedInvoice}
                customer={customer}
                productMap={productMap}
                settings={settings}
                onBack={() => setSelectedInvoice(null)}
                onPrintTicket={() => setDetailViewMode('ticket')}
                users={users}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Lista de Facturas</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setActiveView(View.CreateInvoice)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Crear Factura
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <InvoiceTable 
                    invoices={invoices} 
                    customers={customers} 
                    users={users}
                    onUpdateInvoiceStatus={onUpdateInvoiceStatus}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
};

// --- INVOICE DETAIL VIEW ---
interface InvoiceDetailViewProps {
    invoice: Invoice;
    customer: Customer;
    productMap: Map<string, Product>;
    settings: AppSettings;
    onBack: () => void;
    onPrintTicket: () => void;
    users: User[];
}

const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({ invoice, customer, productMap, settings, onBack, onPrintTicket, users }) => {
    const { companyInfo, itbisRate, invoiceFooter } = settings;
    const salesperson = users.find(u => u.id === invoice.userId)?.name || 'N/A';

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(companyInfo.name, 14, 22);
        doc.setFontSize(10);
        doc.text(`RNC: ${companyInfo.rnc}`, 14, 28);
        doc.text(companyInfo.address, 14, 34);
        
        if (invoice.status === InvoiceStatus.Quote) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('COTIZACIÓN', 190, 22, { align: 'right' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Número: ${invoice.invoiceNumber}`, 190, 28, { align: 'right' });
        } else {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Factura de Crédito Fiscal Electrónica', 190, 22, { align: 'right' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`e-NCF: ${invoice.ncf}`, 190, 28, { align: 'right' });
            doc.text(`Vencimiento e-NCF: 31-12-2026`, 190, 34, { align: 'right' });
            doc.text(`Factura No.:${invoice.invoiceNumber}`, 190, 42, { align: 'right' });
        }

        doc.text(invoice.status === InvoiceStatus.Quote ? 'Cotizado a:' : 'Facturado a:', 14, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(customer.name, 14, 61);
        doc.setFont('helvetica', 'normal');
        doc.text(`RNC: ${customer.rnc}`, 14, 67);
        doc.text(customer.address, 14, 73);

        doc.text(`Fecha: ${invoice.date}`, 190, 55, { align: 'right' });
        doc.text(`Vendedor: ${salesperson}`, 190, 61, { align: 'right' });
        doc.text(`Estado: ${invoice.status}`, 190, 67, { align: 'right' });


        const tableColumn = ["Cant.", "Descripción", "Precio Unit.", "Total"];
        const tableRows: any[] = invoice.items.map(item => {
            const product = productMap.get(item.productId);
            return [
                item.quantity,
                product ? product.name : 'N/A',
                `$${item.price.toFixed(2)}`,
                `$${(item.price * item.quantity).toFixed(2)}`
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 190, finalY + 10, { align: 'right' });
        doc.text(`ITBIS (${itbisRate}%): $${invoice.itbis.toFixed(2)}`, 190, finalY + 15, { align: 'right' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${invoice.total.toFixed(2)}`, 190, finalY + 22, { align: 'right' });

        if (invoiceFooter) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(invoiceFooter, 14, doc.internal.pageSize.height - 10, {
                maxWidth: doc.internal.pageSize.width - 28
            });
        }

        const title = invoice.status === InvoiceStatus.Quote ? 'Cotizacion' : 'Factura';
        doc.save(`${title}-${invoice.ncf}.pdf`);
    };

    const handlePrint = () => {
        const itemsHtml = invoice.items.map(item => {
            const product = productMap.get(item.productId);
            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${product ? product.name : 'N/A'}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        const title = invoice.status === InvoiceStatus.Quote ? 'Cotización' : 'Factura';

        const invoiceInfoHtml = invoice.status === InvoiceStatus.Quote ? `
            <div class="invoice-info">
                <h2 style="font-size: 1.5em; text-transform: uppercase; color: #888;">Cotización</h2>
                <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
            </div>
        ` : `
            <div class="invoice-info">
                <h2>Factura de Crédito Fiscal Electrónica</h2>
                <p><strong>e-NCF:</strong> ${invoice.ncf}</p>
                <p><strong>Vencimiento e-NCF:</strong> 31-12-2026</p>
                <p style="margin-top: 1em;"><strong>Factura No.:</strong>${invoice.invoiceNumber}</p>
            </div>
        `;

        const billToTitle = invoice.status === InvoiceStatus.Quote ? 'Cotizado a' : 'Facturado a';

        const printContent = `
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: sans-serif; font-size: 12px; }
                        .container { max-width: 800px; margin: auto; padding: 20px; }
                        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; align-items: start; }
                        .header-grid .company-info h1 { margin: 0; font-size: 1.5em; }
                        .header-grid .invoice-info { text-align: right; }
                        .header-grid .invoice-info h2 { font-size: 1.2em; font-weight: bold; margin: 0 0 10px 0; }
                        .customer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .customer-grid .details { text-align: right; }
                        .customer-grid .details p { margin: 2px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background-color: #f2f2f2; text-align: left; padding: 8px; }
                        .totals { text-align: right; margin-top: 20px; }
                        .footer { position: fixed; bottom: 20px; font-size: 10px; color: grey; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header-grid">
                            <div class="company-info">
                                <h1>${companyInfo.name}</h1>
                                <p>RNC: ${companyInfo.rnc}</p>
                                <p>${companyInfo.address}</p>
                            </div>
                            ${invoiceInfoHtml}
                        </div>
                        
                        <div class="customer-grid">
                             <div>
                                <p style="text-transform: uppercase; font-size: 0.9em; color: #555;">${billToTitle}</p>
                                <p><strong>${customer.name}</strong></p>
                                <p>RNC: ${customer.rnc}</p>
                                <p>${customer.address}</p>
                            </div>
                            <div class="details">
                                <p><strong>Fecha:</strong> ${invoice.date}</p>
                                <p><strong>Vendedor:</strong> ${salesperson}</p>
                                <p><strong>Estado:</strong> ${invoice.status}</p>
                            </div>
                        </div>

                        <table>
                            <thead><tr><th>Cant.</th><th>Descripción</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Total</th></tr></thead>
                            <tbody>${itemsHtml}</tbody>
                        </table>
                        
                        <div class="totals">
                            <p>Subtotal: <strong>$${invoice.subtotal.toFixed(2)}</strong></p>
                            <p>ITBIS (${itbisRate}%): <strong>$${invoice.itbis.toFixed(2)}</strong></p>
                            <h3>Total: <strong>$${invoice.total.toFixed(2)}</strong></h3>
                        </div>

                        ${invoiceFooter ? `<div class="footer"><p>${invoiceFooter}</p></div>` : ''}
                    </div>
                </body>
            </html>`;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
        }
    };
    
    const getStatusBadge = (status: InvoiceStatus) => {
        switch(status) {
            case InvoiceStatus.Paid: return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-md">{status}</span>;
            case InvoiceStatus.Pending: return <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-200 rounded-md">{status}</span>;
            case InvoiceStatus.Cancelled: return <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-200 rounded-md">{status}</span>;
            case InvoiceStatus.Quote: return <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-200 rounded-md">{status}</span>;
            default: return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-md">{status}</span>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-dark font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5"/>
                    Volver a la Lista
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handleGeneratePDF} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors text-sm">
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-red-500"/>
                        <span>PDF</span>
                    </button>
                    <button onClick={handlePrint} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors text-sm">
                        <PrinterIcon className="w-5 h-5 mr-2 text-blue-500"/>
                        <span>Imprimir</span>
                    </button>
                    <button onClick={onPrintTicket} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors text-sm">
                        <TicketIcon className="w-5 h-5 mr-2 text-gray-600"/>
                        <span>Ticket</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg" id="invoice-preview">
                <header className="flex justify-between items-start pb-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-dark">{companyInfo.name}</h1>
                        <p className="text-sm text-gray-500">{companyInfo.address}</p>
                        <p className="text-sm text-gray-500">RNC: {companyInfo.rnc}</p>
                    </div>
                    <div className="text-right">
                         {invoice.status === InvoiceStatus.Quote ? (
                            <>
                                <h2 className="text-2xl font-bold uppercase text-gray-400">Cotización</h2>
                                <p className="text-sm text-gray-500">Número: {invoice.invoiceNumber}</p>
                            </>
                         ) : (
                            <>
                                <h2 className="text-lg font-bold text-dark">Factura de Crédito Fiscal Electrónica</h2>
                                <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">e-NCF:</span> {invoice.ncf}</p>
                                <p className="text-sm text-gray-700"><span className="font-semibold">Vencimiento e-NCF:</span> 31-12-2026</p>
                                <p className="text-sm text-gray-700 mt-4"><span className="font-semibold">Factura No.:</span>{invoice.invoiceNumber}</p>
                            </>
                         )}
                    </div>
                </header>
                
                <section className="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">{invoice.status === InvoiceStatus.Quote ? 'Cotizado a' : 'Facturado a'}</h3>
                        <p className="font-bold text-dark">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.address}</p>
                        <p className="text-sm text-gray-600">RNC: {customer.rnc}</p>
                    </div>
                     <div className="text-right">
                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-500">Fecha:</span>
                            <span className="text-gray-800">{invoice.date}</span>
                        </div>
                         <div className="grid grid-cols-2 mt-1 items-center">
                            <span className="font-semibold text-gray-500">Estado:</span>
                            <span>{getStatusBadge(invoice.status)}</span>
                        </div>
                        <div className="grid grid-cols-2 mt-1">
                            <span className="font-semibold text-gray-500">Vendedor:</span>
                            <span className="text-gray-800">{salesperson}</span>
                        </div>
                    </div>
                </section>
                
                <section>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="p-3">Descripción</th>
                                <th className="p-3 text-center">Cant.</th>
                                <th className="p-3 text-right">Precio Unit.</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                           {invoice.items.map(item => {
                               const product = productMap.get(item.productId);
                               return (
                                   <tr key={item.productId} className="border-b">
                                       <td className="p-3 font-medium text-dark">{product?.name || 'Producto no encontrado'}</td>
                                       <td className="p-3 text-center">{item.quantity}</td>
                                       <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                                       <td className="p-3 text-right font-semibold">${(item.quantity * item.price).toFixed(2)}</td>
                                   </tr>
                               );
                           })}
                        </tbody>
                    </table>
                </section>
                
                <section className="flex justify-end mt-6">
                    <div className="w-full max-w-xs space-y-2">
                         <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-dark">${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">ITBIS ({itbisRate}%):</span>
                            <span className="font-medium text-dark">${invoice.itbis.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t text-xl font-bold">
                            <span className="text-dark">Total:</span>
                            <span className="text-primary">${invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                {invoiceFooter && (
                    <footer className="border-t mt-8 pt-4">
                        <p className="text-xs text-gray-500 text-center">{invoiceFooter}</p>
                    </footer>
                )}
            </div>
        </div>
    );
};

// --- TICKET PRINT VIEW ---
const TicketPrintView: React.FC<{
    invoice: Invoice;
    customer: Customer;
    productMap: Map<string, Product>;
    settings: AppSettings;
    onBack: () => void;
    users: User[];
}> = ({ invoice, customer, productMap, settings, onBack, users }) => {
    const { companyInfo } = settings;
    const salesperson = users.find(u => u.id === invoice.userId)?.name || 'N/A';

    const handlePrint = () => {
        window.print();
    };

    const isQuote = invoice.status === InvoiceStatus.Quote;
    const title = isQuote ? 'COTIZACIÓN' : 'FACTURA';

    return (
        <div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-ticket, #printable-ticket * {
                        visibility: visible;
                    }
                    #printable-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-dark font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5"/>
                    Volver a la Factura
                </button>
                <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                    <PrinterIcon className="w-5 h-5 mr-2"/>
                    Imprimir Ticket
                </button>
            </div>

            <div id="printable-ticket" className="bg-white p-4 mx-auto font-mono text-xs text-black" style={{ maxWidth: '302px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <div className="text-center">
                    {companyInfo.logo && <img src={companyInfo.logo} alt="logo" className="mx-auto h-12 w-auto mb-2" />}
                    <p className="font-bold text-sm">{companyInfo.name}</p>
                    <p>RNC: {companyInfo.rnc}</p>
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.phone}</p>
                </div>

                <hr className="my-2 border-dashed border-black" />

                <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{new Date(invoice.date + "T00:00:00").toLocaleString('es-DO')}</span>
                </div>
                {!isQuote && (
                    <>
                        <div className="flex justify-between">
                            <span>Factura:</span>
                            <span>{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>e-NCF:</span>
                            <span>{invoice.ncf}</span>
                        </div>
                    </>
                )}
                {isQuote && (
                     <div className="flex justify-between">
                        <span>Cotización:</span>
                        <span>{invoice.invoiceNumber}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Vendedor:</span>
                    <span>{salesperson}</span>
                </div>

                <hr className="my-2 border-dashed border-black" />
                
                <p>Cliente: {customer.name}</p>
                <p>RNC: {customer.rnc}</p>

                <hr className="my-2 border-dashed border-black" />

                {/* Items Header */}
                <div className="grid grid-cols-12 gap-1 font-bold">
                    <div className="col-span-6">DESC</div>
                    <div className="col-span-2 text-center">CANT</div>
                    <div className="col-span-4 text-right">TOTAL</div>
                </div>

                <hr className="my-1 border-dashed border-black" />

                {/* Items Body */}
                {invoice.items.map(item => {
                    const product = productMap.get(item.productId);
                    return (
                        <div key={item.productId} className="mb-1">
                            <div className="grid grid-cols-12 gap-1">
                                <div className="col-span-6">{product?.name || 'N/A'}</div>
                                <div className="col-span-2 text-center">{item.quantity}</div>
                                <div className="col-span-4 text-right">${(item.quantity * item.price).toFixed(2)}</div>
                            </div>
                             <div className="text-gray-600 text-right pr-1" style={{fontSize: '0.65rem'}}>
                                @ ${item.price.toFixed(2)}
                            </div>
                        </div>
                    );
                })}

                <hr className="my-2 border-dashed border-black" />

                {/* Totals */}
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ITBIS ({settings.itbisRate}%):</span>
                        <span>${invoice.itbis.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                        <span>TOTAL:</span>
                        <span>${invoice.total.toFixed(2)}</span>
                    </div>
                </div>

                <hr className="my-2 border-dashed border-black" />

                <p className="text-center font-bold text-base">{title}</p>
                <p className="text-center">Estado: {invoice.status}</p>
                <p className="text-center">Método de Pago: {invoice.paymentMethod}</p>
                
                <hr className="my-2 border-dashed border-black" />
                
                <p className="text-center">{settings.invoiceFooter}</p>

            </div>
        </div>
    );
};


// --- INVOICE TABLE (REUSABLE) ---
interface InvoiceTableProps {
    invoices: Invoice[];
    customers: Customer[];
    users: User[];
    onUpdateInvoiceStatus?: (invoiceId: string, newStatus: InvoiceStatus) => void;
    onRowClick?: (invoice: Invoice) => void;
}
const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, customers, users, onUpdateInvoiceStatus, onRowClick }) => {
    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'N/A';
    const getUserName = (id?: string) => {
        if (!id) return 'N/A';
        return users.find(u => u.id === id)?.name || 'Desconocido';
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        switch(status) {
            case InvoiceStatus.Paid: return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
            case InvoiceStatus.Pending: return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">{status}</span>;
            case InvoiceStatus.Cancelled: return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">{status}</span>;
            case InvoiceStatus.Quote: return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">{status}</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Factura #</th>
                        <th scope="col" className="px-6 py-3">NCF</th>
                        <th scope="col" className="px-6 py-3">Cliente</th>
                        <th scope="col" className="px-6 py-3">Fecha</th>
                        <th scope="col" className="px-6 py-3">Vendedor</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                        <th scope="col" className="px-6 py-3">Estado</th>
                        {onUpdateInvoiceStatus && <th scope="col" className="px-6 py-3">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr 
                            key={invoice.id} 
                            className={`bg-white border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(invoice)}
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{invoice.invoiceNumber}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{invoice.ncf}</td>
                            <td className="px-6 py-4">{getCustomerName(invoice.customerId)}</td>
                            <td className="px-6 py-4">{invoice.date}</td>
                            <td className="px-6 py-4">{getUserName(invoice.userId)}</td>
                            <td className="px-6 py-4">${invoice.total.toFixed(2)}</td>
                            <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                            {onUpdateInvoiceStatus && (
                                <td className="px-6 py-4">
                                    {invoice.status === InvoiceStatus.Pending && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateInvoiceStatus(invoice.id, InvoiceStatus.Paid);
                                            }}
                                            className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1.5"
                                        >
                                            <BanknotesIcon className="w-4 h-4"/>
                                            Marcar Pagada
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- PRODUCTS VIEW ---
interface ProductsProps {
    products: Product[];
    onCreate: (data: Omit<Product, 'id'>) => void;
    onUpdate: (data: Product) => void;
    onDelete: (id: string) => void;
    currentUser: User | null;
}
const ProductsView: React.FC<ProductsProps> = ({ products, onCreate, onUpdate, onDelete, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [productToPrint, setProductToPrint] = useState<Product | null>(null);
    
    const isSalesperson = currentUser?.role === UserRole.Sales;

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const openPrintModal = (product: Product) => {
        setProductToPrint(product);
        setIsPrintModalOpen(true);
    };

    const handleSubmit = (productData: Product | Omit<Product, 'id'>) => {
        if (editingProduct) {
            onUpdate(productData as Product);
        } else {
            onCreate(productData as Omit<Product, 'id'>);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Productos</h1>
                {!isSalesperson && (
                    <button onClick={openCreateModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Crear Producto
                    </button>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">SKU</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Código de Barras</th>
                            <th scope="col" className="px-6 py-3">Precio</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.sku}</td>
                                <td className="px-6 py-4">{product.name}</td>
                                <td className="px-6 py-4 font-mono">{product.barcode || 'N/A'}</td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openPrintModal(product)} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100" title="Imprimir Etiqueta"><BarcodeIcon className="w-4 h-4" /></button>
                                        {!isSalesperson && (
                                            <>
                                                <button onClick={() => openEditModal(product)} className="p-2 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-100" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => onDelete(product.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="w-4 h-4" /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && !isSalesperson && (
                <ProductFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    product={editingProduct}
                />
            )}
            {isPrintModalOpen && (
                <BarcodePrintModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    product={productToPrint}
                />
            )}
        </div>
    );
};

// --- BARCODE PRINT MODAL ---
interface BarcodePrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ isOpen, onClose, product }) => {
    useEffect(() => {
        if (isOpen && product?.barcode) {
            try {
                JsBarcode('#barcode-svg', product.barcode, {
                    format: "CODE128",
                    displayValue: true,
                    fontSize: 14,
                    textMargin: 0,
                    height: 50,
                });
            } catch (e) {
                console.error("Error generating barcode", e);
            }
        }
    }, [isOpen, product]);

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen || !product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Imprimir Etiqueta de Producto">
             <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-label, #printable-label * {
                            visibility: visible;
                        }
                        #printable-label {
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}
            </style>
            <div id="printable-label" className="text-center p-4 border rounded-lg">
                <p className="font-bold text-lg truncate">{product.name}</p>
                <p className="text-sm">${product.price.toFixed(2)}</p>
                <svg id="barcode-svg" className="mx-auto mt-2"></svg>
            </div>
             <div className="flex justify-end gap-2 pt-4 mt-4 border-t no-print">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="button" onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <PrinterIcon className="w-5 h-5"/> Imprimir
                </button>
            </div>
        </Modal>
    );
};


// --- PRODUCT FORM MODAL ---
interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Product | Omit<Product, 'id'>) => void;
    product: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, product }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'> & { id?: string }>({
        id: product?.id || undefined,
        name: product?.name || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        description: product?.description || '',
        price: product?.price || 0,
        cost: product?.cost || 0,
        stock: product?.stock || 0,
        category: product?.category || '',
        hasItbis: product?.hasItbis ?? true,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const generateBarcode = () => {
        // Generates a random 13-digit number (EAN-13 like, without checksum logic for simplicity)
        const newBarcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        setFormData(prev => ({ ...prev, barcode: newBarcode.substring(0, 13) }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Producto' : 'Crear Producto'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={commonLabelClass}>Nombre del Producto</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
                    </div>
                    <div>
                        <label htmlFor="sku" className={commonLabelClass}>SKU</label>
                        <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} className={commonInputClass} />
                    </div>
                </div>
                <div>
                    <label htmlFor="barcode" className={commonLabelClass}>Código de Barras</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} className={`${commonInputClass} mt-0`} />
                        <button type="button" onClick={generateBarcode} className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm whitespace-nowrap">Generar</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className={commonLabelClass}>Descripción</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={commonInputClass}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="price" className={commonLabelClass}>Precio de Venta</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className={commonInputClass} min="0" step="0.01" />
                    </div>
                     <div>
                        <label htmlFor="cost" className={commonLabelClass}>Costo</label>
                        <input type="number" name="cost" id="cost" value={formData.cost} onChange={handleChange} className={commonInputClass} min="0" step="0.01" />
                    </div>
                     <div>
                        <label htmlFor="stock" className={commonLabelClass}>Stock</label>
                        <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className={commonInputClass} min="0" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="category" className={commonLabelClass}>Categoría</label>
                    <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={commonInputClass} />
                </div>
                <div className="flex items-center pt-2">
                    <input
                        type="checkbox"
                        name="hasItbis"
                        id="hasItbis"
                        checked={formData.hasItbis}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="hasItbis" className="ml-2 block text-sm text-gray-900">
                        Este producto aplica ITBIS
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Producto</button>
                </div>
            </form>
        </Modal>
    );
};

// --- CUSTOMERS VIEW ---
interface CustomersProps {
    customers: Customer[];
    onCreate: (data: Omit<Customer, 'id'>) => void;
    onUpdate: (data: Customer) => void;
    onDelete: (id: string) => void;
}
const CustomersView: React.FC<CustomersProps> = ({ customers, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const openCreateModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleSubmit = (customerData: Customer | Omit<Customer, 'id'>) => {
        if (editingCustomer) {
            onUpdate(customerData as Customer);
        } else {
            onCreate(customerData as Omit<Customer, 'id'>);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Clientes</h1>
                <button onClick={openCreateModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Cliente
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">RNC/Cédula</th>
                            <th scope="col" className="px-6 py-3">Teléfono</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{customer.name}</td>
                                <td className="px-6 py-4">{customer.rnc}</td>
                                <td className="px-6 py-4">{customer.phone}</td>
                                <td className="px-6 py-4">{customer.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEditModal(customer)} className="p-2 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-100" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(customer.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <CustomerFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    customer={editingCustomer}
                />
            )}
        </div>
    );
};

// --- CUSTOMER FORM MODAL ---
interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Customer | Omit<Customer, 'id'>) => void;
    customer: Customer | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, customer }) => {
    const [formData, setFormData] = useState({
        id: customer?.id || undefined,
        name: customer?.name || '',
        rnc: customer?.rnc || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Editar Cliente' : 'Crear Cliente'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={commonLabelClass}>Nombre o Razón Social</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label htmlFor="rnc" className={commonLabelClass}>RNC / Cédula</label>
                    <input type="text" name="rnc" id="rnc" value={formData.rnc} onChange={handleChange} className={commonInputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className={commonLabelClass}>Teléfono</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div>
                        <label htmlFor="email" className={commonLabelClass}>Correo Electrónico</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={commonInputClass} />
                    </div>
                </div>
                <div>
                    <label htmlFor="address" className={commonLabelClass}>Dirección</label>
                    <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className={commonInputClass}></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Cliente</button>
                </div>
            </form>
        </Modal>
    );
};


// --- USERS VIEW ---
interface UsersProps {
    users: User[];
    onCreate: (data: Omit<User, 'id'>) => boolean;
    onUpdate: (data: User) => void;
    onDelete: (id: string) => void;
}
const UsersView: React.FC<UsersProps> = ({ users, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSubmit = (userData: User | Omit<User, 'id'>) => {
        if (editingUser) {
            onUpdate(userData as User);
        } else {
            onCreate(userData as Omit<User, 'id'>);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Usuarios</h1>
                <button onClick={openCreateModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Usuario
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Usuario</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">
                                    {user.active ? 
                                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Activo</span> :
                                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Inactivo</span>
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEditModal(user)} className="p-2 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-100" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(user.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    user={editingUser}
                    users={users}
                />
            )}
        </div>
    );
};

// --- USER FORM MODAL ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: User | Omit<User, 'id'>) => void;
    user: User | null;
    users: User[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user, users }) => {
    const [formData, setFormData] = useState({
        id: user?.id || undefined,
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        role: user?.role || UserRole.Sales,
        active: user?.active ?? true,
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const adminExists = users.some(u => u.role === UserRole.Admin);
    const isEditingTheAdmin = user?.role === UserRole.Admin;
    const isAdminRoleDisabled = adminExists && !isEditingTheAdmin;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user && password === '') {
            alert('La contraseña es obligatoria para nuevos usuarios.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        onSubmit(formData);
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Crear Usuario'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={commonLabelClass}>Nombre Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
                    </div>
                    <div>
                        <label htmlFor="username" className={commonLabelClass}>Nombre de Usuario</label>
                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className={commonInputClass} required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="email" className={commonLabelClass}>Correo Electrónico</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className={commonLabelClass}>Contraseña</label>
                        <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={commonInputClass} placeholder={user ? 'Dejar en blanco para no cambiar' : ''} />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className={commonLabelClass}>Confirmar Contraseña</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={commonInputClass} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="role" className={commonLabelClass}>Rol</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className={commonInputClass}>
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role} disabled={role === UserRole.Admin && isAdminRoleDisabled}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center pt-2">
                    <input
                        type="checkbox"
                        name="active"
                        id="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                        Usuario Activo
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Usuario</button>
                </div>
            </form>
        </Modal>
    );
};

// --- SETTINGS VIEW ---
interface SettingsProps {
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
    onExport: () => void;
    onImport: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ settings, setSettings, onExport, onImport }) => {
    const [formData, setFormData] = useState(settings);
    const [logoPreview, setLogoPreview] = useState(settings.companyInfo.logo);
    const [activeTab, setActiveTab] = useState('empresa');
    const [isNcfModalOpen, setIsNcfModalOpen] = useState(false);

    const handleInfoChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            companyInfo: { ...prev.companyInfo, [name]: value }
        }));
    };

    const handleSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'itbisRate' ? Number(value) : value }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setLogoPreview(result);
                setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, logo: result }
                }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleAddNcfSequence = (newSequence: Omit<NCFSequence, 'id' | 'active' | 'currentSequence'>) => {
        setFormData(prev => ({
            ...prev,
            ncfSequences: [
                ...prev.ncfSequences,
                {
                    ...newSequence,
                    id: `ncf-${Date.now()}`,
                    active: false,
                    currentSequence: newSequence.initialSequence,
                }
            ]
        }));
    };
    
    const handleActivateNcf = (sequenceId: string) => {
        const sequenceToActivate = formData.ncfSequences.find(s => s.id === sequenceId);
        if (!sequenceToActivate) return;

        setFormData(prev => ({
            ...prev,
            ncfSequences: prev.ncfSequences.map(seq => {
                if (seq.prefix === sequenceToActivate.prefix) {
                    return { ...seq, active: seq.id === sequenceId };
                }
                return seq;
            })
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSettings(formData);
        alert('Configuración guardada exitosamente.');
    };

    const tabs = [
        { id: 'empresa', label: 'Datos de la Empresa', icon: BuildingOfficeIcon },
        { id: 'facturacion', label: 'Facturación y NCF', icon: TicketIcon },
        { id: 'documentos', label: 'Documentos y Plantillas', icon: DocumentTextIcon },
        { id: 'backup', label: 'Copias de Seguridad', icon: DatabaseIcon },
        { id: 'integraciones', label: 'Integraciones', icon: PuzzlePieceIcon },
        { id: 'seguridad', label: 'Usuarios y Seguridad', icon: UsersIcon },
    ];

    const renderContent = () => {
        const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
        const commonLabelClass = "block text-sm font-medium text-gray-700";

        switch (activeTab) {
            case 'empresa':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Datos de la Empresa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className={commonLabelClass}>Nombre o razón social</label>
                                <input type="text" name="name" id="name" value={formData.companyInfo.name} onChange={handleInfoChange} className={commonInputClass} />
                            </div>
                            <div>
                                <label htmlFor="rnc" className={commonLabelClass}>RNC / NIF</label>
                                <input type="text" name="rnc" id="rnc" value={formData.companyInfo.rnc} onChange={handleInfoChange} className={commonInputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address" className={commonLabelClass}>Dirección</label>
                                <textarea name="address" id="address" rows={2} value={formData.companyInfo.address} onChange={handleInfoChange} className={commonInputClass}></textarea>
                            </div>
                             <div>
                                <label htmlFor="phone" className={commonLabelClass}>Teléfono</label>
                                <input type="tel" name="phone" id="phone" value={formData.companyInfo.phone || ''} onChange={handleInfoChange} className={commonInputClass} />
                            </div>
                             <div>
                                <label htmlFor="email" className={commonLabelClass}>Correo Electrónico</label>
                                <input type="email" name="email" id="email" value={formData.companyInfo.email || ''} onChange={handleInfoChange} className={commonInputClass} />
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="website" className={commonLabelClass}>Página Web</label>
                                <input type="url" name="website" id="website" value={formData.companyInfo.website || ''} onChange={handleInfoChange} className={commonInputClass} placeholder="https://www.ejemplo.com"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className={commonLabelClass}>Logo</label>
                                <div className="mt-1 flex items-center">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto mr-4 object-contain rounded-md bg-gray-100 p-1" />
                                    ) : (
                                        <div className="h-16 w-16 mr-4 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                            <BuildingOfficeIcon className="w-8 h-8"/>
                                        </div>
                                    )}
                                    <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center">
                                        <UploadIcon className="w-5 h-5 mr-2"/>
                                        <span>Cambiar Logo</span>
                                        <input id="logo-upload" name="logo" type="file" className="sr-only" onChange={handleLogoChange} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'facturacion':
                return (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Parámetros de Facturación</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="itbisRate" className={commonLabelClass}>Tasa de ITBIS (%)</label>
                                <input type="number" name="itbisRate" id="itbisRate" value={formData.itbisRate} onChange={handleSettingsChange} className={commonInputClass} />
                            </div>
                            <div>
                                <label htmlFor="currencySymbol" className={commonLabelClass}>Símbolo de Moneda</label>
                                <input type="text" name="currencySymbol" id="currencySymbol" value={formData.currencySymbol} onChange={handleSettingsChange} className={commonInputClass} placeholder="Ej: RD$, $, USD" />
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-dark">Gestión de NCF / Comprobantes Fiscales</h2>
                                <button type="button" onClick={() => setIsNcfModalOpen(true)} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-secondary/90 transition-colors text-sm">
                                    <PlusIcon className="w-4 h-4 mr-2"/>
                                    Agregar Secuencia
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Prefijo</th>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3">Rango</th>
                                            <th className="px-4 py-3">Uso</th>
                                            <th className="px-4 py-3 text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.ncfSequences.map(seq => {
                                            const total = seq.finalSequence - seq.initialSequence + 1;
                                            const used = seq.currentSequence - seq.initialSequence;
                                            const percentage = total > 0 ? (used / total) * 100 : 0;
                                            return (
                                            <tr key={seq.id} className="bg-white border-b">
                                                <td className="px-4 py-3 font-mono font-bold text-dark">{seq.prefix}</td>
                                                <td className="px-4 py-3">{seq.description}</td>
                                                <td className="px-4 py-3 font-mono">{seq.initialSequence} - {seq.finalSequence}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                                                        </div>
                                                        <span className="text-xs font-medium">{used}/{total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {seq.active ? (
                                                         <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Activo</span>
                                                    ) : (
                                                        <button type="button" onClick={() => handleActivateNcf(seq.id)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-300">Activar</button>
                                                    )}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {isNcfModalOpen && <NcfSequenceModal isOpen={isNcfModalOpen} onClose={() => setIsNcfModalOpen(false)} onSubmit={handleAddNcfSequence} />}
                    </div>
                );
            case 'documentos':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Documentos y Plantillas</h2>
                        <div className="space-y-6">
                           <div>
                                <label htmlFor="invoiceFooter" className={commonLabelClass}>Mensaje Personalizado (Pie de Página)</label>
                                <textarea name="invoiceFooter" id="invoiceFooter" rows={3} value={formData.invoiceFooter} onChange={handleSettingsChange} className={commonInputClass} placeholder="Ej: Gracias por su compra."></textarea>
                                <p className="text-xs text-gray-500 mt-1">Este texto aparecerá al final de todas las facturas, cotizaciones y recibos.</p>
                           </div>
                        </div>
                    </div>
                );
            case 'backup':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Respaldo y Recuperación de Datos</h2>
                        <p className="text-sm text-gray-600 mb-4">Exporte toda la información del sistema a un archivo JSON. Puede importarlo en cualquier momento para restaurar el estado completo de la aplicación.</p>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={onExport} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-600 transition-colors">
                                <ArrowDownTrayIcon className="w-5 h-5 mr-2"/>
                                Exportar Datos
                            </button>
                            <label className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-600 transition-colors">
                                <ArrowUpTrayIcon className="w-5 h-5 mr-2"/>
                                <span>Importar Datos</span>
                                <input type="file" className="hidden" accept=".json" onChange={onImport} />
                            </label>
                        </div>
                    </div>
                 );
            case 'integraciones':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Integraciones</h2>
                        <p className="text-sm text-gray-600 mb-4">Conecte el sistema con otros servicios. (Función no implementada)</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border p-4 rounded-lg flex justify-between items-center bg-gray-50 opacity-60">
                                <div>
                                    <p className="font-bold">Plataforma de Pagos</p>
                                    <p className="text-sm text-gray-500">Acepte pagos con tarjeta en línea.</p>
                                </div>
                                <button type="button" className="bg-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm cursor-not-allowed">Conectar</button>
                            </div>
                             <div className="border p-4 rounded-lg flex justify-between items-center bg-gray-50 opacity-60">
                                <div>
                                    <p className="font-bold">Software de Contabilidad</p>
                                    <p className="text-sm text-gray-500">Sincronice sus ventas y gastos.</p>
                                </div>
                                <button type="button" className="bg-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm cursor-not-allowed">Conectar</button>
                            </div>
                        </div>
                    </div>
                );
            case 'seguridad':
                return (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-dark mb-4">Usuarios y Seguridad</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            La gestión de usuarios y roles se realiza en la sección <span className="font-semibold text-primary">Usuarios</span> del menú principal.
                            <br/><br/>
                            Futuras opciones como políticas de contraseñas, doble autenticación y registro de actividad de usuarios aparecerán aquí.
                        </p>
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold text-gray-700">Próximamente:</h3>
                            <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
                                <li>Políticas de fortaleza de contraseñas.</li>
                                <li>Autenticación de dos factores (2FA).</li>
                                <li>Registro de auditoría de acciones de usuario.</li>
                            </ul>
                        </div>
                    </div>
                );

            default: return null;
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-dark mb-6">Configuración</h1>
            <p className="text-gray-600 mb-8 -mt-4">Aquí se establecen los parámetros generales del sistema.</p>
            
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Nav */}
                    <nav className="md:w-1/4 w-full sticky top-6">
                        <ul className="space-y-1">
                            {tabs.map(tab => (
                                <li key={tab.id}>
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                                            activeTab === tab.id 
                                                ? 'bg-primary text-white font-semibold' 
                                                : 'text-gray-600 hover:bg-gray-200 hover:text-dark'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right Content */}
                    <div className="md:w-3/4 w-full">
                        <div className="space-y-8">
                            {renderContent()}
                        </div>
                         {/* Save Button */}
                        <div className="flex justify-end pt-6 mt-6 border-t">
                            <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg shadow hover:bg-primary/90 transition-colors font-semibold">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

// --- NCF SEQUENCE MODAL ---
interface NcfSequenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<NCFSequence, 'id' | 'active' | 'currentSequence'>) => void;
}

const NcfSequenceModal: React.FC<NcfSequenceModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        prefix: 'B01',
        description: '',
        initialSequence: 1,
        finalSequence: 1,
    });
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (formData.finalSequence < formData.initialSequence) {
            alert("La secuencia final no puede ser menor que la inicial.");
            return;
        }
        onSubmit(formData);
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nueva Secuencia NCF">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="prefix" className={commonLabelClass}>Prefijo (Ej: B01, B14)</label>
                    <input type="text" name="prefix" id="prefix" value={formData.prefix} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label htmlFor="description" className={commonLabelClass}>Descripción</label>
                    <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className={commonInputClass} placeholder="Ej: Facturas de Consumo" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="initialSequence" className={commonLabelClass}>Secuencia Inicial</label>
                        <input type="number" name="initialSequence" id="initialSequence" value={formData.initialSequence} onChange={handleChange} min="1" className={commonInputClass} required />
                    </div>
                     <div>
                        <label htmlFor="finalSequence" className={commonLabelClass}>Secuencia Final</label>
                        <input type="number" name="finalSequence" id="finalSequence" value={formData.finalSequence} onChange={handleChange} min={formData.initialSequence} className={commonInputClass} required />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Secuencia</button>
                </div>
             </form>
        </Modal>
    );
};

// --- REPORTS VIEW ---
interface ReportsProps {
    invoices: Invoice[];
    customers: Customer[];
    products: Product[];
    purchases: Purchase[];
    suppliers: Supplier[];
    settings: AppSettings;
    currentUser: User | null;
}

const ReportsView: React.FC<ReportsProps> = ({ invoices, customers, products, purchases, suppliers, settings, currentUser }) => {
    type ReportType = null | 'sales' | 'purchases' | 'receivables' | 'itbis' | 'balance';
    const [activeReport, setActiveReport] = useState<ReportType>(null);
    const [reportTitle, setReportTitle] = useState('Central de Reportes');

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);
    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const handleSelectReport = (report: ReportType, title: string) => {
        setActiveReport(report);
        setReportTitle(title);
    };

    const ReportHeader: React.FC = () => (
        <div className="flex items-center mb-6">
            {activeReport !== null && (
                 <button onClick={() => { setActiveReport(null); setReportTitle('Central de Reportes'); }} className="flex items-center gap-2 text-gray-600 hover:text-dark font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors mr-4">
                    <ChevronLeftIcon className="w-5 h-5"/>
                    Volver
                </button>
            )}
            <h1 className="text-3xl font-bold text-dark">{reportTitle}</h1>
        </div>
    );
    
    const generatePdfForTable = (title: string, dateRange: string, head: any[], body: any[], summaryLines: string[] = []) => {
        const doc = new jsPDF();
        const { companyInfo } = settings;

        doc.setFontSize(16);
        doc.text(companyInfo.name, 14, 22);
        doc.setFontSize(10);
        doc.text(`RNC: ${companyInfo.rnc}`, 14, 28);

        doc.setFontSize(14);
        doc.text(title, 190, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.text(dateRange, 190, 28, { align: 'right' });

        autoTable(doc, {
            head: [head],
            body: body,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        if (summaryLines.length > 0) {
            const finalY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumen del Reporte', 14, finalY + 15);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            summaryLines.forEach((line, index) => {
                doc.text(line, 14, finalY + 22 + (index * 6));
            });
        }
        
        doc.save(`${title.replace(/ /g, '_')}.pdf`);
    };

    const ReportMenu = () => {
        const ReportCard: React.FC<{icon: React.FC<any>, title:string, description: string, onClick: () => void}> = ({icon: Icon, title, description, onClick}) => (
            <button onClick={onClick} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:border-primary border-2 border-transparent transition-all text-left w-full flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <Icon className="w-8 h-8"/>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-dark">{title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{description}</p>
                </div>
            </button>
        );
        
        const isSalesperson = currentUser?.role === UserRole.Sales;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard icon={ChartBarIcon} title="Reporte de Ventas" description="Analiza tus ventas por período o rango de fechas." onClick={() => handleSelectReport('sales', 'Reporte de Ventas')} />
                <ReportCard icon={BanknotesIcon} title="Cuentas por Cobrar" description="Lista de facturas pendientes de pago y sus vencimientos." onClick={() => handleSelectReport('receivables', 'Cuentas por Cobrar')} />
                {!isSalesperson && (
                    <>
                        <ReportCard icon={ShoppingCartIcon} title="Reporte de Compras" description="Revisa todas las compras realizadas a suplidores." onClick={() => handleSelectReport('purchases', 'Reporte de Compras')} />
                        <ReportCard icon={ReceiptPercentIcon} title="Reporte de ITBIS" description="Calcula el ITBIS cobrado y pagado para tus declaraciones." onClick={() => handleSelectReport('itbis', 'Reporte de ITBIS')} />
                        <ReportCard icon={ScaleIcon} title="Balance General" description="Resumen financiero de activos, pasivos y patrimonio." onClick={() => handleSelectReport('balance', 'Balance General')} />
                    </>
                )}
            </div>
        )
    };
    
    // Components for each report
    const SalesReport = () => {
        const [period, setPeriod] = useState<'custom' | 'weekly' | 'bi-weekly' | 'monthly'>('custom');
        const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
        const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
        const [filtered, setFiltered] = useState<Invoice[]>([]);
        const [dateRange, setDateRange] = useState('');

        useEffect(() => {
            const today = new Date();
            let start = new Date();
            let end = new Date();

            if (period === 'weekly') {
                start = new Date(today.setDate(today.getDate() - today.getDay()));
            } else if (period === 'bi-weekly') {
                const dayOfMonth = today.getDate();
                if (dayOfMonth <= 15) {
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    end = new Date(today.getFullYear(), today.getMonth(), 15);
                } else {
                    start = new Date(today.getFullYear(), today.getMonth(), 16);
                    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                }
            } else if (period === 'monthly') {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            } else {
                start = new Date(startDate);
                end = new Date(endDate);
            }
            
            start.setHours(0,0,0,0);
            end.setHours(23,59,59,999);
            
            const validInvoices = invoices.filter(inv => inv.status !== InvoiceStatus.Cancelled && inv.status !== InvoiceStatus.Quote);
            const result = validInvoices.filter(inv => {
                const invDate = new Date(inv.date + "T00:00:00");
                return invDate >= start && invDate <= end;
            });
            setFiltered(result);
            const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            setDateRange(`${start.toLocaleDateString('es-DO', formatOptions)} - ${end.toLocaleDateString('es-DO', formatOptions)}`);

        }, [period, startDate, endDate, invoices]);
        
        const totalSales = filtered.reduce((sum, inv) => sum + inv.total, 0);

        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="md:flex justify-between items-center mb-4 border-b pb-4">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        {(['weekly', 'bi-weekly', 'monthly'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${period === p ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                {p === 'weekly' ? 'Semanal' : p === 'bi-weekly' ? 'Quincenal' : 'Mensual'}
                            </button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPeriod('custom'); }} className="border p-1.5 rounded-md text-sm text-gray-900"/>
                        <span>-</span>
                        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPeriod('custom'); }} className="border p-1.5 rounded-md text-sm text-gray-900"/>
                     </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{dateRange}</p>
                     <button onClick={() => generatePdfForTable('Reporte de Ventas', dateRange, ["NCF", "Cliente", "Fecha", "Total"], filtered.map(inv => [inv.ncf, customerMap.get(inv.customerId) || 'N/A', inv.date, `${settings.currencySymbol} ${inv.total.toFixed(2)}`]), [`Total de Facturas: ${filtered.length}`, `Monto Total Vendido: ${settings.currencySymbol} ${totalSales.toFixed(2)}`])} className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center shadow hover:bg-red-600 text-sm"><DocumentArrowDownIcon className="w-4 h-4 mr-2"/> PDF</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">NCF</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(inv => (
                                <tr key={inv.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-dark">{inv.ncf}</td>
                                    <td className="px-6 py-4">{customerMap.get(inv.customerId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{inv.date}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{settings.currencySymbol} {inv.total.toFixed(2)}</td>
                                </tr>
                            ))}
                             <tr className="bg-gray-50 font-bold">
                                <td colSpan={3} className="px-6 py-3 text-right">Total:</td>
                                <td className="px-6 py-3 text-right">{settings.currencySymbol} {totalSales.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const PurchasesReport = () => {
        const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
        const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

        const filtered = useMemo(() => {
             let start = new Date(startDate);
             let end = new Date(endDate);
             start.setHours(0,0,0,0);
             end.setHours(23,59,59,999);
             return purchases.filter(p => {
                 const pDate = new Date(p.date + "T00:00:00");
                 return pDate >= start && pDate <= end;
             });
        }, [startDate, endDate, purchases]);
        
        const totalPurchases = filtered.reduce((sum, p) => sum + p.total, 0);
        const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateRange = `${new Date(startDate + "T00:00:00").toLocaleDateString('es-DO', formatOptions)} - ${new Date(endDate + "T00:00:00").toLocaleDateString('es-DO', formatOptions)}`;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="md:flex justify-between items-center mb-4 border-b pb-4">
                     <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Desde:</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-1.5 rounded-md text-sm text-gray-900"/>
                        <label className="text-sm font-medium">Hasta:</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-1.5 rounded-md text-sm text-gray-900"/>
                     </div>
                     <button onClick={() => generatePdfForTable('Reporte de Compras', dateRange, ["Fecha", "Suplidor", "# Factura", "NCF", "Total"], filtered.map(p => [p.date, supplierMap.get(p.supplierId) || 'N/A', p.invoiceNumber, p.ncf, `${settings.currencySymbol} ${p.total.toFixed(2)}`]), [`Total de Compras: ${filtered.length}`, `Monto Total Comprado: ${settings.currencySymbol} ${totalPurchases.toFixed(2)}`])} className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center shadow hover:bg-red-600 text-sm mt-4 md:mt-0"><DocumentArrowDownIcon className="w-4 h-4 mr-2"/> PDF</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Suplidor</th>
                                <th className="px-6 py-3"># Factura</th>
                                <th className="px-6 py-3">NCF</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="bg-white border-b">
                                    <td className="px-6 py-4">{p.date}</td>
                                    <td className="px-6 py-4 font-medium text-dark">{supplierMap.get(p.supplierId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{p.invoiceNumber}</td>
                                    <td className="px-6 py-4">{p.ncf}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{settings.currencySymbol} {p.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const AccountsReceivableReport = () => {
        const pendingInvoices = useMemo(() => invoices.filter(inv => inv.status === InvoiceStatus.Pending), [invoices]);
        const totalReceivable = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

        const getDaysOverdue = (dateStr: string) => {
            const today = new Date();
            const invDate = new Date(dateStr + "T00:00:00");
            if (isNaN(invDate.getTime())) return 'N/A';
            const diffTime = today.getTime() - invDate.getTime();
            return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        };

        return (
             <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Total por cobrar: <span className="font-bold text-lg text-dark">{settings.currencySymbol} {totalReceivable.toFixed(2)}</span></p>
                    <button onClick={() => generatePdfForTable(
                        'Cuentas por Cobrar', 
                        new Date().toLocaleDateString('es-DO'), 
                        ["NCF", "Cliente", "Fecha", "Días Venc.", "Total Pendiente"], 
                        pendingInvoices.map(inv => [inv.ncf, customerMap.get(inv.customerId) || 'N/A', inv.date, getDaysOverdue(inv.date), `${settings.currencySymbol} ${inv.total.toFixed(2)}`]), 
                        [`Total de Facturas Pendientes: ${pendingInvoices.length}`, `Monto Total por Cobrar: ${settings.currencySymbol} ${totalReceivable.toFixed(2)}`]
                    )} className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center shadow hover:bg-red-600 text-sm"><DocumentArrowDownIcon className="w-4 h-4 mr-2"/> PDF</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">NCF</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Fecha Emisión</th>
                                <th className="px-6 py-3 text-center">Días Vencida</th>
                                <th className="px-6 py-3 text-right">Total Pendiente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingInvoices.map(inv => (
                                <tr key={inv.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-dark">{inv.ncf}</td>
                                    <td className="px-6 py-4">{customerMap.get(inv.customerId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{inv.date}</td>
                                    <td className="px-6 py-4 text-center">{getDaysOverdue(inv.date)}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{settings.currencySymbol} {inv.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const ITBISReport = () => {
        const totalSalesItbis = invoices
            .filter(inv => inv.status !== InvoiceStatus.Cancelled && inv.status !== InvoiceStatus.Quote)
            .reduce((sum, inv) => sum + inv.itbis, 0);
        const totalPurchasesItbis = purchases.reduce((sum, p) => sum + p.itbis, 0);
        const itbisToPay = totalSalesItbis - totalPurchasesItbis;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Resumen de ITBIS (Impuesto sobre Transferencias de Bienes Industrializados y Servicios)</h3>
                <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="font-semibold text-blue-800">ITBIS Cobrado en Ventas:</span>
                        <span className="font-bold text-blue-800">{settings.currencySymbol} {totalSalesItbis.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                        <span className="font-semibold text-green-800">ITBIS Pagado en Compras (Crédito Fiscal):</span>
                        <span className="font-bold text-green-800">{settings.currencySymbol} {totalPurchasesItbis.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between p-4 bg-gray-100 rounded-lg border-t-2 border-gray-300">
                        <span className="font-semibold text-gray-900">ITBIS a Pagar a DGII (Cobrado - Pagado):</span>
                        <span className="font-bold text-lg text-gray-900">{settings.currencySymbol} {itbisToPay.toFixed(2)}</span>
                    </div>
                </div>
                 <p className="text-xs text-gray-500 mt-4">Nota: Este es un cálculo preliminar. Consulte a su contador para la declaración oficial.</p>
            </div>
        );
    };

    const BalanceReport = () => {
         return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-2xl text-gray-700">Próximamente...</h2>
                <p className="text-gray-500 mt-2">El reporte de Balance General está en desarrollo.</p>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeReport) {
            case null:
                return <ReportMenu />;
            case 'sales':
                return <SalesReport />;
            case 'purchases':
                return <PurchasesReport />;
            case 'receivables':
                return <AccountsReceivableReport />;
            case 'itbis':
                return <ITBISReport />;
            case 'balance':
                return <BalanceReport />;
            default:
                return <p>Reporte no encontrado.</p>;
        }
    };
    
    return (
        <div>
            <ReportHeader />
            {renderContent()}
        </div>
    );
};


// --- CREATE INVOICE VIEW (POS) ---
interface CreateInvoiceProps {
    products: Product[];
    customers: Customer[];
    settings: AppSettings;
    onCreateInvoice: (data: { customerId: string; items: InvoiceItem[]; paymentMethod: string; }) => void;
    onCreateQuote: (data: { customerId: string; items: InvoiceItem[]; }) => void;
    onBack: () => void;
}

const CreateInvoiceView: React.FC<CreateInvoiceProps> = ({ products, customers, settings, onCreateInvoice, onCreateQuote, onBack }) => {
    const [cart, setCart] = useState<InvoiceItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [barcode, setBarcode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');

    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                return [...prevCart, { productId: product.id, quantity, price: product.price, hasItbis: product.hasItbis }];
            }
        });
    };

    const updateCartQuantity = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.productId !== productId);
            }
            return prevCart.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const handleBarcodeScan = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && barcode.trim() !== '') {
            const product = products.find(p => p.barcode === barcode.trim());
            if (product) {
                addToCart(product);
                setBarcode('');
            } else {
                alert('Producto con este código de barras no encontrado.');
            }
            e.preventDefault();
        }
    };
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit results for performance
    }, [searchTerm, products]);

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const taxableSubtotal = useMemo(() => cart.filter(item => item.hasItbis).reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const itbis = useMemo(() => taxableSubtotal * (settings.itbisRate / 100), [taxableSubtotal, settings.itbisRate]);
    const total = useMemo(() => subtotal + itbis, [subtotal, itbis]);

    const handleFinalizeSale = () => {
        if (!selectedCustomer) {
            alert("Por favor, seleccione un cliente.");
            return;
        }
        if (cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }
        onCreateInvoice({
            customerId: selectedCustomer.id,
            items: cart,
            paymentMethod,
        });
    };
    
     const handleSaveQuote = () => {
        if (!selectedCustomer) {
            alert("Por favor, seleccione un cliente.");
            return;
        }
        if (cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }
        onCreateQuote({
            customerId: selectedCustomer.id,
            items: cart
        });
    };

    const CartItem: React.FC<{ item: InvoiceItem }> = ({ item }) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        return (
            <div className="flex items-center justify-between p-4">
                <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className="w-14 bg-gray-800 text-white font-bold rounded-md py-1 px-2 text-center"
                        min="1"
                    />
                    <button className="text-green-500 hover:text-green-700">
                        <ReceiptPercentIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Left: Product Search & List */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            />
                            {searchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} onClick={() => { addToCart(p); setSearchTerm(''); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                            {p.name} <span className="text-sm text-gray-500">({p.sku})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                         <div className="relative">
                            <BarcodeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Escanear código de barras..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={handleBarcodeScan}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            />
                        </div>
                    </div>
                    {/* Product Grid - Placeholder or quick access */}
                    <div className="flex-grow overflow-y-auto pr-2">
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map(product => (
                                <button key={product.id} onClick={() => addToCart(product)} className={`p-2 border rounded-lg text-center ${product.stock > 0 ? 'hover:border-primary hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`} disabled={product.stock <= 0}>
                                    <div className="w-full h-20 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                                        {/* Placeholder for image */}
                                        <ProductIcon className="w-10 h-10 text-gray-400"/>
                                    </div>
                                    <p className="text-sm font-semibold truncate text-dark">{product.name}</p>
                                    <p className="text-xs text-gray-500">{settings.currencySymbol}{product.price.toFixed(2)}</p>
                                    <p className={`text-xs font-bold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        Stock: {product.stock}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right: Cart */}
                <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-dark p-4 border-b">Resumen de Venta</h2>
                    
                    <div className="p-4">
                        <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                         <select
                            id="customer-select"
                            value={selectedCustomer?.id || ''}
                            onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                            className="w-full py-2.5 px-3 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="" disabled>Seleccione un cliente</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto">
                        {cart.length > 0 ? (
                            cart.map(item => <CartItem key={item.productId} item={item} />)
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 flex-col px-4 text-center">
                                <ShoppingCartIcon className="w-12 h-12 mb-2"/>
                                <p>Agregue productos a la venta</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 space-y-3 mt-auto">
                        <hr/>
                        <div className="flex justify-between text-md">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-800">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-md">
                            <span className="text-gray-600">ITBIS ({settings.itbisRate}%):</span>
                            <span className="font-medium text-gray-800">{settings.currencySymbol}{itbis.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                            <span className="text-dark">Total:</span>
                            <span className="text-primary">{settings.currencySymbol}{total.toFixed(2)}</span>
                        </div>

                         <div className="pt-2">
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full py-2.5 px-3 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                <option>Efectivo</option>
                                <option>Transferencia</option>
                                <option>Tarjeta de Crédito</option>
                                <option>Crédito</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50 border-t">
                        <button onClick={handleSaveQuote} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                           <SparklesIcon className="w-5 h-5"/> Cotizar
                        </button>
                        <button onClick={handleFinalizeSale} disabled={cart.length === 0} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                           <CreditCardIcon className="w-5 h-5"/> Facturar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- INVENTORY VIEW ---
interface InventoryProps {
    products: Product[];
    inventoryMovements: InventoryMovement[];
    onStockMovement: (productId: string, quantity: number, type: InventoryMovementType.Entry | InventoryMovementType.Exit, reason: string) => void;
    onStockAdjustment: (productId: string, newStock: number, reason: string) => void;
    currentUser: User | null;
}

const InventoryView: React.FC<InventoryProps> = ({ products, inventoryMovements, onStockMovement, onStockAdjustment, currentUser }) => {
    const [filter, setFilter] = useState('');
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [view, setView] = useState<'list' | 'movements'>('list');
    
    const isSalesperson = currentUser?.role === UserRole.Sales;
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.sku.toLowerCase().includes(filter.toLowerCase()) ||
        p.barcode?.includes(filter)
    );
    
    const filteredMovements = inventoryMovements.filter(m =>
        productMap.get(m.productId)?.toLowerCase().includes(filter.toLowerCase()) || 
        m.reason.toLowerCase().includes(filter.toLowerCase())
    );

    const handleOpenMovementModal = (product: Product) => {
        setSelectedProduct(product);
        setIsMovementModalOpen(true);
    };

    const handleOpenAdjustmentModal = (product: Product) => {
        setSelectedProduct(product);
        setIsAdjustmentModalOpen(true);
    };

    const handleMovementSubmit = (data: { type: InventoryMovementType.Entry | InventoryMovementType.Exit; quantity: number; reason: string }) => {
        if (!selectedProduct) return;
        const quantity = data.type === InventoryMovementType.Entry ? data.quantity : -data.quantity;
        onStockMovement(selectedProduct.id, quantity, data.type, data.reason);
    };
    
    const handleAdjustmentSubmit = (data: { newStock: number; reason: string }) => {
        if (!selectedProduct) return;
        onStockAdjustment(selectedProduct.id, data.newStock, data.reason);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Control de Inventario</h1>
                <div>
                     <button onClick={() => setView(view === 'list' ? 'movements' : 'list')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors">
                        <ArrowPathIcon className="w-5 h-5 mr-2"/>
                        {view === 'list' ? 'Ver Movimientos' : 'Ver Lista de Productos'}
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                     <input
                        type="text"
                        placeholder={view === 'list' ? "Buscar por nombre, SKU o código de barras..." : "Buscar por producto o razón..."}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full max-w-lg pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                </div>
                {view === 'list' ? (
                     <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">SKU</th>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3 text-center">Stock Actual</th>
                                {!isSalesperson && <th className="px-6 py-3 text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-800">{product.sku}</td>
                                    <td className="px-6 py-4 font-medium text-dark">{product.name}</td>
                                    <td className={`px-6 py-4 text-center font-bold text-xl ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {product.stock}
                                    </td>
                                    {!isSalesperson && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                 <button onClick={() => handleOpenMovementModal(product)} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1.5">
                                                    <PlusIcon className="w-4 h-4"/>
                                                    Entrada/Salida
                                                </button>
                                                <button onClick={() => handleOpenAdjustmentModal(product)} className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-yellow-200 transition-colors flex items-center gap-1.5">
                                                    <WrenchScrewdriverIcon className="w-4 h-4"/>
                                                    Ajustar
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3 text-center">Cantidad</th>
                                <th className="px-6 py-3">Razón</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredMovements.map(mov => (
                                <tr key={mov.id} className="bg-white border-b">
                                    <td className="px-6 py-4">{mov.date}</td>
                                    <td className="px-6 py-4 font-medium text-dark">{productMap.get(mov.productId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{mov.type}</td>
                                    <td className={`px-6 py-4 text-center font-semibold ${mov.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{mov.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {isMovementModalOpen && selectedProduct && !isSalesperson && (
                <StockMovementModal 
                    isOpen={isMovementModalOpen}
                    onClose={() => setIsMovementModalOpen(false)}
                    onSubmit={handleMovementSubmit}
                    productName={selectedProduct.name}
                />
            )}
             {isAdjustmentModalOpen && selectedProduct && !isSalesperson && (
                <StockAdjustmentModal 
                    isOpen={isAdjustmentModalOpen}
                    onClose={() => setIsAdjustmentModalOpen(false)}
                    onSubmit={handleAdjustmentSubmit}
                    productName={selectedProduct.name}
                    currentStock={selectedProduct.stock}
                />
            )}
        </div>
    );
};

// --- STOCK MOVEMENT MODAL ---
interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { type: InventoryMovementType.Entry | InventoryMovementType.Exit; quantity: number; reason: string }) => void;
    productName: string;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onSubmit, productName }) => {
    const [type, setType] = useState<InventoryMovementType.Entry | InventoryMovementType.Exit>(InventoryMovementType.Entry);
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ type, quantity, reason });
        onClose();
    };
    
    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Movimiento para: ${productName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Movimiento</label>
                    <select value={type} onChange={e => setType(e.target.value as (InventoryMovementType.Entry | InventoryMovementType.Exit))} className={commonInputClass}>
                        <option value={InventoryMovementType.Entry}>Entrada Manual</option>
                        <option value={InventoryMovementType.Exit}>Salida Manual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className={commonInputClass} required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Razón / Motivo</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} className={commonInputClass} required placeholder="Ej: Mercancía dañada, Donación..."/>
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Confirmar</button>
                </div>
            </form>
        </Modal>
    );
};

// --- STOCK ADJUSTMENT MODAL ---
interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { newStock: number; reason: string }) => void;
    productName: string;
    currentStock: number;
}
const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onSubmit, productName, currentStock }) => {
    const [newStock, setNewStock] = useState(currentStock);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ newStock, reason });
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ajustar Stock de: ${productName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
                    <p className="text-lg font-bold mt-1">{currentStock}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nuevo Stock Físico</label>
                    <input type="number" value={newStock} onChange={e => setNewStock(Number(e.target.value))} min="0" className={commonInputClass} required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Razón del Ajuste</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} className={commonInputClass} required placeholder="Ej: Conteo físico anual, Error de sistema..."/>
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Ajustar Stock</button>
                </div>
            </form>
        </Modal>
    );
};


// --- SUPPLIERS VIEW ---
interface SuppliersProps {
    suppliers: Supplier[];
    purchases: Purchase[];
    onCreate: (data: Omit<Supplier, 'id'>) => void;
    onUpdate: (data: Supplier) => void;
    onDelete: (id: string) => void;
}
const SuppliersView: React.FC<SuppliersProps> = ({ suppliers, purchases, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const openCreateModal = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };
    
    const handleSubmit = (supplierData: Supplier | Omit<Supplier, 'id'>) => {
        if (editingSupplier) {
            onUpdate(supplierData as Supplier);
        } else {
            onCreate(supplierData as Omit<Supplier, 'id'>);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Suplidores</h1>
                 <button onClick={openCreateModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-primary/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Crear Suplidor
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <table className="w-full text-sm text-left text-gray-500">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">RNC</th>
                            <th className="px-6 py-3">Teléfono</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                             <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-dark">{s.name}</td>
                                <td className="px-6 py-4">{s.rnc}</td>
                                <td className="px-6 py-4">{s.phone}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEditModal(s)} className="p-2 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-100" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(s.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <SupplierFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    supplier={editingSupplier}
                />
            )}
        </div>
    );
};

// --- SUPPLIER FORM MODAL ---
interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Supplier | Omit<Supplier, 'id'>) => void;
    supplier: Supplier | null;
}
const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSubmit, supplier }) => {
    const [formData, setFormData] = useState({
        id: supplier?.id || undefined,
        name: supplier?.name || '',
        rnc: supplier?.rnc || '',
        phone: supplier?.phone || '',
        address: supplier?.address || '',
    });

     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={supplier ? 'Editar Suplidor' : 'Crear Suplidor'}>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name" className={commonLabelClass}>Nombre o Razón Social</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rnc" className={commonLabelClass}>RNC</label>
                        <input type="text" name="rnc" id="rnc" value={formData.rnc} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div>
                        <label htmlFor="phone" className={commonLabelClass}>Teléfono</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={commonInputClass} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="address" className={commonLabelClass}>Dirección</label>
                    <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className={commonInputClass}></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Suplidor</button>
                </div>
             </form>
        </Modal>
    );
};


// --- PURCHASES AND EXPENSES VIEW ---
interface PurchasesProps {
    purchases: Purchase[];
    expenses: Expense[];
    suppliers: Supplier[];
    products: Product[];
    onCreatePurchase: (data: Omit<Purchase, 'id' | 'total' | 'subtotal' | 'itbis'>) => void;
    onCreateExpense: (data: Omit<Expense, 'id'>) => void;
}
const PurchasesView: React.FC<PurchasesProps> = ({ purchases, expenses, suppliers, products, onCreatePurchase, onCreateExpense }) => {
    const [view, setView] = useState<'purchases' | 'expenses'>('purchases');
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    
    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Compras y Gastos</h1>
                 <div className="flex items-center gap-2">
                     <button onClick={() => setIsPurchaseModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-600 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Registrar Compra
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-600 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Registrar Gasto
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setView('purchases')} className={`${view === 'purchases' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Compras</button>
                        <button onClick={() => setView('expenses')} className={`${view === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Gastos</button>
                    </nav>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {view === 'purchases' ? (
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Suplidor</th>
                                <th className="px-6 py-3">NCF</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => (
                                <tr key={p.id} className="bg-white border-b">
                                    <td className="px-6 py-4">{p.date}</td>
                                    <td className="px-6 py-4 font-medium text-dark">{supplierMap.get(p.supplierId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{p.ncf}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.paymentStatus === 'Pagada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.paymentStatus}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold">${p.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Descripción</th>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(e => (
                                <tr key={e.id} className="bg-white border-b">
                                    <td className="px-6 py-4">{e.date}</td>
                                    <td className="px-6 py-4 font-medium text-dark">{e.description}</td>
                                    <td className="px-6 py-4">{e.category}</td>
                                    <td className="px-6 py-4 text-right font-semibold">${e.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isPurchaseModalOpen && <PurchaseFormModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} onSubmit={onCreatePurchase} suppliers={suppliers} products={products} />}
            {isExpenseModalOpen && <ExpenseFormModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSubmit={onCreateExpense} />}
        </div>
    );
};

// --- PURCHASE FORM MODAL ---
interface PurchaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Purchase, 'id' | 'total' | 'subtotal' | 'itbis'>) => void;
    suppliers: Supplier[];
    products: Product[];
}
// Fix: Completed the PurchaseFormModal component, adding the return statement with JSX for the modal UI.
const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({ isOpen, onClose, onSubmit, suppliers, products }) => {
    const [formData, setFormData] = useState<Omit<Purchase, 'id' | 'total' | 'subtotal' | 'itbis'>>({
        supplierId: suppliers[0]?.id || '',
        invoiceNumber: '',
        ncf: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        status: 'Recibida',
        paymentStatus: 'Pendiente',
    });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cost, setCost] = useState(0);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0 || cost <= 0) {
            alert("Por favor, complete todos los campos del producto.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: selectedProduct, quantity, cost }]
        }));
        setSelectedProduct('');
        setQuantity(1);
        setCost(0);
    };

    const handleRemoveItem = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.productId !== productId)
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            alert("Debe agregar al menos un producto a la compra.");
            return;
        }
        onSubmit(formData);
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Compra">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={commonLabelClass}>Suplidor</label>
                        <select name="supplierId" value={formData.supplierId} onChange={handleChange} className={commonInputClass} required>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={commonLabelClass}>Fecha</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className={commonInputClass} required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={commonLabelClass}>Número de Factura Suplidor</label>
                        <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div>
                        <label className={commonLabelClass}>NCF</label>
                        <input type="text" name="ncf" value={formData.ncf} onChange={handleChange} className={commonInputClass} />
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium text-dark">Agregar Productos</h3>
                    <div className="grid grid-cols-12 gap-2 items-end mt-2">
                        <div className="col-span-5">
                            <label className={commonLabelClass}>Producto</label>
                            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className={commonInputClass}>
                                <option value="">Seleccionar...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className={commonLabelClass}>Cant.</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className={commonInputClass} />
                        </div>
                        <div className="col-span-3">
                            <label className={commonLabelClass}>Costo Unit.</label>
                            <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} min="0.01" step="0.01" className={commonInputClass} />
                        </div>
                        <div className="col-span-2">
                            <button type="button" onClick={handleAddItem} className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90">Agregar</button>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Items de la Compra</h4>
                    <div className="space-y-2">
                        {formData.items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-medium">{product?.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x @ ${item.cost.toFixed(2)}</p>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            );
                        })}
                        {formData.items.length === 0 && <p className="text-sm text-gray-500">No hay productos en esta compra.</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={commonLabelClass}>Estado de Recepción</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={commonInputClass}>
                            <option value="Recibida">Recibida</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </div>
                    <div>
                        <label className={commonLabelClass}>Estado de Pago</label>
                        <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className={commonInputClass}>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagada">Pagada</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Compra</button>
                </div>
            </form>
        </Modal>
    );
};

// Fix: Added missing ExpenseFormModal component.
// --- EXPENSE FORM MODAL ---
interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Expense, 'id'>) => void;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: ExpenseCategory.Other,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Gasto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className={commonLabelClass}>Fecha</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div>
                    <label htmlFor="description" className={commonLabelClass}>Descripción</label>
                    <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className={commonInputClass} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className={commonLabelClass}>Monto</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} min="0.01" step="0.01" className={commonInputClass} required />
                    </div>
                    <div>
                        <label htmlFor="category" className={commonLabelClass}>Categoría</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} className={commonInputClass}>
                            {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Guardar Gasto</button>
                </div>
            </form>
        </Modal>
    );
};

// Fix: Add default export for App component
export default App;
