'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Plus, Minus, CreditCard, Droplet, Shirt, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { id: 'todos', name: 'Todos', icon: Star },
  { id: 'paletas', name: 'Paletas', icon: Zap },
  { id: 'accesorios', name: 'Accesorios', icon: Droplet },
  { id: 'indumentaria', name: 'Indumentaria', icon: Shirt },
  { id: 'bebidas', name: 'Bebidas', icon: Droplet },
];

const PRODUCTS = [
  { id: 1, name: 'Paleta Bullpadel Hack 03', category: 'paletas', price: 150000, image: '🏸', isNew: true },
  { id: 2, name: 'Tubo de Pelotas Head Pro', category: 'accesorios', price: 8500, image: '🎾', isNew: false },
  { id: 3, name: 'Grip Tourna (x3)', category: 'accesorios', price: 4500, image: '🩹', isNew: false },
  { id: 4, name: 'Remera Oficial Peñarol', category: 'indumentaria', price: 25000, image: '👕', isNew: true },
  { id: 5, name: 'Gatorade Manzana', category: 'bebidas', price: 1500, image: '🧃', isNew: false },
  { id: 6, name: 'Paleta Nox AT10 Genius', category: 'paletas', price: 145000, image: '🎾', isNew: false },
];

export default function TiendaPage() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [cart, setCart] = useState<{ id: number, quantity: number }[]>([]);

  const filteredProducts = activeCategory === 'todos' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((total, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  const addToCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, quantity: 1 }];
    });
    toast.success('Agregado al carrito', { style: { background: '#22c55e', color: '#000' } });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-12 pb-32">
        
        {/* Header Cinemático */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative"
        >
          <div className="space-y-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none relative">
              Pro <span className="text-primary relative inline-block">
                Shop
                <motion.div 
                  className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </span>
            </h1>
            <p className="text-sm opacity-50 font-bold uppercase tracking-widest max-w-xl">
              Equipamiento oficial, bebidas y alquileres. Agregalo a tu turno y pagá en el club.
            </p>
          </div>

          {/* Carrito Resumen */}
          {cart.length > 0 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-6 rounded-[2rem] border border-primary/30 shadow-[0_0_30px_rgba(136,130,220,0.15)] flex items-center gap-6"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <ShoppingBag size={24} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-black text-xs font-black flex items-center justify-center shadow-lg">
                  {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Total</p>
                <p className="text-2xl font-black text-white">${cartTotal.toLocaleString()}</p>
              </div>
              <button className="px-6 py-3 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_15px_rgba(136,130,220,0.3)]">
                Reservar
              </button>
            </motion.div>
          )}
        </motion.header>

        {/* Próximamente State */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative glass p-12 md:p-24 rounded-[3rem] border border-white/5 overflow-hidden flex flex-col items-center justify-center text-center mt-8 min-h-[50vh]"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center space-y-8 max-w-2xl">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_50px_rgba(136,130,220,0.3)] mb-4"
            >
              <ShoppingBag size={48} />
            </motion.div>
            
            <div className="flex flex-col items-center gap-6">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white/50 backdrop-blur-md">
                En Construcción
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mt-2">
                Próxi<span className="text-primary">mamente</span>
              </h2>
            </div>
            
            <p className="text-sm md:text-base opacity-50 font-bold uppercase tracking-widest leading-relaxed">
              Estamos preparando el mejor Pro Shop para que puedas equiparte, alquilar paletas y comprar bebidas directamente desde la app.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast('¡Aviso programado! Te enviaremos una notificación por la app.', { icon: '🔔', style: { background: '#1a2235', color: '#fff', border: '1px solid #c084fc' } })}
              className="mt-8 px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_0_20px_rgba(136,130,220,0.4)]"
            >
              Notificarme cuando abra
            </motion.button>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}
