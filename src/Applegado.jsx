import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Menu,
  Library,
  MinusCircle,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  CircleDollarSign,
  RefreshCcw,
  Pencil,
  X,
  Loader,
  BedDouble,
  CheckCircle,
  Tag,
  Bath,
  Car,
  Waves,
  Check,
  User,
  UserPlus,
  ExternalLink,
  Activity,
  Heart,
  Wallet,
  Home,
  Target,
  Plus,
  Settings,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart as PieIcon,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  collection,
  onSnapshot,
  query,
  addDoc,
  doc,
  where,
  updateDoc,
  orderBy,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// --- HELPERS ---
const hashPassword = async (string) => {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
};

const formatCurrency = (val) =>
  (Number(val) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const getMonthName = (date) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);

function TransferModal({ isOpen, onClose, userProfile, goals, onTransfer }) {
  if (!isOpen) return null;
  const [amount, setAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedGoalId || !amount) return;
    setLoading(true);
    try {
      // Aqui chamamos a lógica de transferência (ex: atualizar o saldo da meta no Firestore)
      // Como o fluxo depende da sua função de update das metas,
      // passamos para o onTransfer realizar a operação.
      await onTransfer(selectedGoalId, Number(amount));
      onClose();
      setAmount("");
    } catch (err) {
      alert("Erro na transferência: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#0D4233] p-6 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tighter">
            Transferir p/ Reserva
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleTransfer} className="p-8 space-y-4 text-left">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Quanto deseja guardar?
            </p>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="R$ 0,00"
              className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-black text-xl outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Escolha a Meta do DuoBank
            </p>
            <select
              required
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold outline-none"
            >
              <option value="">Para qual reserva?</option>
              {goals?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} (Saldo: {formatCurrency(g.currentAmount)})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D4233] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg"
          >
            {loading ? "Processando..." : "Confirmar Transferência"}
          </button>
        </form>
      </div>
    </div>
  );
}

function IncomeModal({ isOpen, onClose, userProfile, categories }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [incomeType, setIncomeType] = useState("unique"); // unique, fixed, period
  const [months, setMonths] = useState(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;

    try {
      // Ajustamos a data para o meio do dia para evitar problemas de fuso horário
      const adjustedDate = new Date(startDate + "T12:00:00Z").toISOString();

      await addDoc(collection(db, "incomes"), {
        description: f.description.value,
        amount: Number(f.amount.value),
        category: f.category.value,
        type: incomeType,
        // Se for fixa, guardamos um número alto de meses; se for período, o valor do input
        totalMonths:
          incomeType === "period"
            ? Number(months)
            : incomeType === "fixed"
            ? 999
            : 1,
        date: adjustedDate,
        user: userProfile?.name || "Usuário Duo",
        createdAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      alert("Erro ao salvar receita: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        {/* CABEÇALHO */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} />
            <h3 className="font-black uppercase tracking-tighter text-lg">
              Nova Receita
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left">
          {/* DESCRIÇÃO E VALOR */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                O que recebeu?
              </p>
              <input
                name="description"
                required
                placeholder="Ex: Salário, Venda, Bónus..."
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                Valor
              </p>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* DATA DE INÍCIO */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Mês de Referência / Início
            </p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* TIPO DE RECORRÊNCIA */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Frequência
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "unique", label: "Mês Único" },
                { id: "fixed", label: "Fixo Mensal" },
                { id: "period", label: "Por Período" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIncomeType(t.id)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${
                    incomeType === t.id
                      ? "border-emerald-600 bg-emerald-50 text-emerald-600 shadow-sm"
                      : "border-slate-50 text-slate-400 grayscale opacity-70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* CAMPO EXTRA PARA PERÍODO */}
          {incomeType === "period" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                Repetir por quantos meses?
              </p>
              <input
                type="number"
                min="1"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full bg-slate-50 border-2 border-emerald-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* CATEGORIA */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Categoria
            </p>
            <select
              name="category"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none appearance-none focus:border-emerald-500"
            >
              <option value="">Escolha uma categoria...</option>
              {categories
                ?.filter((c) => c.type === "GAIN" || !c.type)
                .map((cat) => (
                  <option key={cat.id} value={cat.label || cat.name}>
                    {cat.label || cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* BOTÃO SALVAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Confirmar Receita"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ExpenseModal({ isOpen, onClose, userProfile, categories }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState("unique");
  const [installments, setInstallments] = useState(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;

    try {
      const adjustedDate = new Date(startDate + "T12:00:00Z").toISOString();

      // LOGICA INVERTIDA: Se for parcelado, o valor digitado é a parcela.
      // Multiplicamos para salvar o TOTAL no banco (mantendo a compatibilidade com a dashboard)
      const inputAmount = Number(f.amount.value);
      const finalTotalAmount =
        expenseType === "installment"
          ? inputAmount * Number(installments)
          : inputAmount;

      await addDoc(collection(db, "expenses"), {
        description: f.description.value,
        amount: finalTotalAmount, // Salva o total calculado
        category: f.category.value,
        type: expenseType,
        isFixed: expenseType === "fixed",
        isInstallment: expenseType === "installment",
        totalInstallments:
          expenseType === "installment" ? Number(installments) : 1,
        startDate: adjustedDate,
        dueDay: Number(startDate.split("-")[2]),
        user: userProfile?.name || "Usuário Duo",
        payments: [],
        createdAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      alert("Erro ao salvar despesa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 text-left">
        <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingDown size={24} />
            <h3 className="font-black uppercase tracking-tighter text-lg">
              Nova Despesa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                Descrição
              </p>
              <input
                name="description"
                required
                placeholder="Ex: Cartão, Empréstimo..."
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-rose-400 transition-all"
              />
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                {expenseType === "installment"
                  ? "Valor da Parcela (Mensal)"
                  : "Valor Total"}
              </p>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black text-xl outline-none focus:border-rose-400 transition-all"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Data de Início / Vencimento
            </p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-rose-400"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Tipo de Gasto
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "unique", label: "Único" },
                { id: "fixed", label: "Fixo" },
                { id: "installment", label: "Parcelado" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setExpenseType(t.id)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${
                    expenseType === t.id
                      ? "border-rose-600 bg-rose-50 text-rose-600 shadow-sm"
                      : "border-slate-50 text-slate-400 opacity-70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {expenseType === "installment" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                Número de Parcelas
              </p>
              <input
                type="number"
                min="2"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full bg-slate-50 border-2 border-rose-100 p-4 rounded-2xl font-bold outline-none focus:border-rose-400"
              />
              {/* Resumo informativo */}
              <p className="text-[9px] font-bold text-rose-400 mt-2 ml-2 uppercase">
                Total da dívida será:{" "}
                {formatCurrency(
                  Number(installments) *
                    (Number(document.getElementsByName("amount")[0]?.value) ||
                      0)
                )}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
              Categoria
            </p>
            <select
              name="category"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-rose-400"
            >
              <option value="">Selecione...</option>
              {categories
                ?.filter(
                  (c) => c.type === "EXPENSE" || c.type === "LOSS" || !c.type
                )
                .map((cat) => (
                  <option key={cat.id} value={cat.label || cat.name}>
                    {cat.icon} {cat.label || cat.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Salvando..." : "Lançar Despesa"}
          </button>
        </form>
      </div>
    </div>
  );
}
function CategoryModal({ category, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(category?.type || "EXPENSE");
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || "💰");

  const iconOptions = [
    "💰",
    "🏠",
    "🛒",
    "🍔",
    "🚗",
    "⚡",
    "📶",
    "🎬",
    "👕",
    "✈️",
    "🛠️",
    "💻",
    "🍱",
    "💊",
    "🎁",
    "🎓",
    "🏋️",
    "🐾",
    "🧼",
    "🍷",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      label: e.target.label.value,
      name: e.target.label.value,
      icon: selectedIcon,
      color: e.target.color.value,
      type: type,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(data, category?.id);
      onClose();
    } catch (error) {
      alert("Erro ao salvar categoria: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
        {/* HEADER */}
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl tracking-tighter uppercase">
            {category ? "Editar Categoria" : "Nova Categoria"}
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* SELETOR DE TIPO (ENTRADA/SAÍDA) */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                type === "EXPENSE"
                  ? "bg-rose-500 text-white shadow-md"
                  : "text-slate-400"
              }`}
            >
              Saída
            </button>
            <button
              type="button"
              onClick={() => setType("GAIN")}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                type === "GAIN"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400"
              }`}
            >
              Entrada
            </button>
          </div>

          {/* NOME DA CATEGORIA */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Nome da Categoria
            </label>
            <input
              name="label"
              defaultValue={category?.label || category?.name}
              required
              placeholder="Ex: Aluguel, Salário, Lazer..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-slate-400"
            />
          </div>

          {/* COR E ÍCONE SELECIONADO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Cor
              </label>
              <input
                name="color"
                type="color"
                defaultValue={
                  category?.color ||
                  (type === "EXPENSE" ? "#e11d48" : "#10b981")
                }
                className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl p-1 cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Ícone
              </label>
              <div className="text-2xl flex items-center justify-center h-12 bg-slate-50 rounded-2xl border-2 border-slate-100">
                {selectedIcon}
              </div>
            </div>
          </div>

          {/* GRID DE ÍCONES */}
          <div className="grid grid-cols-5 gap-2 pb-4 max-h-32 overflow-y-auto custom-scrollbar p-1">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`text-xl p-2 rounded-xl hover:bg-slate-100 transition-all ${
                  selectedIcon === icon
                    ? "bg-slate-100 scale-110"
                    : "grayscale opacity-50"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* BOTÃO SALVAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Categoria"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TransactionModal({
  onClose,
  userProfile,
  editingTransaction,
  categories,
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(editingTransaction?.type || "EXPENSE");
  const [recurrence, setRecurrence] = useState(
    editingTransaction?.recurrence || "UNIQUE"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;
    const data = {
      description: f.description.value,
      value: Number(f.value.value),
      category: f.category.value,
      type,
      recurrence,
      date: f.date.value,
      userId: userProfile.id,
      userName: userProfile.name.split(" ")[0],
      createdAt: new Date().toISOString(),
    };
    if (recurrence === "DURATION") data.endDate = f.endDate.value;
    try {
      if (editingTransaction)
        await updateDoc(doc(db, "finances", editingTransaction.id), data);
      else await addDoc(collection(db, "finances"), data);
      onClose();
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl">Lançamento</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase ${
                type === "EXPENSE" ? "bg-rose-500 text-white" : "text-slate-400"
              }`}
            >
              Saída
            </button>
            <button
              type="button"
              onClick={() => setType("GAIN")}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase ${
                type === "GAIN" ? "bg-emerald-500 text-white" : "text-slate-400"
              }`}
            >
              Entrada
            </button>
          </div>
          <select
            name="category"
            defaultValue={editingTransaction?.category}
            required
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold appearance-none"
          >
            <option value="">Categoria...</option>
            {categories
              .filter((c) => c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
          </select>
          <input
            name="description"
            defaultValue={editingTransaction?.description}
            required
            placeholder="Descrição"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="value"
              type="number"
              step="0.01"
              defaultValue={editingTransaction?.value}
              required
              placeholder="Valor"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black"
            />
            <input
              name="date"
              type="date"
              required
              defaultValue={
                editingTransaction?.date ||
                new Date().toISOString().split("T")[0]
              }
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4"
            />
          </div>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="w-full bg-slate-100 rounded-2xl p-4 font-bold"
          >
            <option value="UNIQUE">Único</option>
            <option value="FIXED">Fixo Mensal</option>
            <option value="DURATION">Duração</option>
          </select>
          {recurrence === "DURATION" && (
            <input
              name="endDate"
              type="date"
              required
              className="w-full bg-orange-50 border-2 border-orange-100 rounded-2xl p-4"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-lg"
          >
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
}

function UserModal({ user, onClose, onSave, allUsers }) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;
    const data = {
      name: f.name.value,
      email: f.email.value,
      username: f.username.value.toLowerCase(),
      phone: f.phone.value,
      role: f.role.value,
      partnerId: f.partnerId.value || null,
      accountingStartDate: f.accountingStartDate.value || null,
    };
    if (f.password.value) data.password = await hashPassword(f.password.value);
    await onSave(data, user?.id);
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in duration-300">
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl">Configurar Duo</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <input
            name="name"
            defaultValue={user?.name}
            required
            placeholder="Nome"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="username"
              defaultValue={user?.username}
              required
              placeholder="Usuário"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none"
            />
            <input
              name="phone"
              defaultValue={user?.phone}
              placeholder="Telefone"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none"
            />
          </div>
          <input
            name="email"
            type="email"
            defaultValue={user?.email}
            required
            placeholder="E-mail"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none"
          />
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              required={!user}
              placeholder="Senha"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 text-slate-400"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-2">
              Data Inicial do Saldo
            </label>
            <input
              name="accountingStartDate"
              type="date"
              defaultValue={
                user?.accountingStartDate ||
                new Date().toISOString().split("T")[0]
              }
              className="w-full bg-white border-2 border-emerald-100 rounded-xl p-3 outline-none"
            />
            <p className="text-[9px] text-emerald-600/70 mt-2 leading-tight">
              * Lançamentos antes desta data serão ignorados no saldo acumulado.
            </p>
          </div>

          <select
            name="partnerId"
            defaultValue={user?.partnerId || ""}
            className="w-full bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 font-bold"
          >
            <option value="">Sem Casal</option>
            {allUsers
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  Casal com: {u.name}
                </option>
              ))}
          </select>
          <select
            name="role"
            defaultValue={user?.role || "USUARIO"}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="SUPERUSUARIO">SUPERUSUÁRIO</option>
            <option value="USUARIO">USUÁRIO</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
function Sidebar({ view, setView, userProfile, isOpen, setIsOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Resumo", icon: LayoutDashboard },
    { id: "finances", label: "Finanças", icon: Wallet },
    { id: "home_config", label: "Nossa Casa", icon: Home },
    { id: "properties", label: "Moradia", icon: Target },
    { id: "duo_bank", label: "DuoBank", icon: Library },
  ];

  return (
    <>
      {/* Fundo escuro no mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[140] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-[150] w-72 bg-emerald-950 text-white flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <Home size={24} />
            </div>
            <h1 className="font-black text-xl tracking-tighter">DuoGesto</h1>
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>
        <div className="p-4 flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                view === item.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-emerald-900/50 opacity-40">
            <button
              onClick={() => {
                setView("categories");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${
                view === "categories"
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-800/40"
              }`}
            >
              <Tag size={18} /> Categorias
            </button>
            {userProfile.role === "ADMIN" && (
              <button
                onClick={() => {
                  setView("admin_users");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${
                  view === "admin_users"
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-emerald-800/40"
                }`}
              >
                <UserPlus size={18} /> Gerir Duo
              </button>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-emerald-900 bg-emerald-950/40">
          <button
            onClick={() => {
              localStorage.removeItem("duogesto_uid");
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 text-xs font-black text-rose-400 w-full py-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </nav>
    </>
  );
}

export default function DuoGestoApp() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [resetMonth, setResetMonth] = useState(null);
  const [incomeType, setIncomeType] = useState("unique");
  const [duration, setDuration] = useState(1);
  const [metaPercent, setMetaPercent] = useState(70);
  const [bankHistory, setBankHistory] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [view, setView] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedBankForDeposit, setSelectedBankForDeposit] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [duoBanks, setDuoBanks] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentFilterDate, setCurrentFilterDate] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSaveCategory = async (cData, id) => {
    try {
      if (id) {
        await updateDoc(doc(db, "categories", id), cData);
      } else {
        await addDoc(collection(db, "categories"), cData);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (e) {
      alert("Erro ao salvar categoria: " + e.message);
    }
  };

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),

          label:
            doc.data().label ||
            doc.data().name ||
            doc.data().nome ||
            "Sem Nome",
          type: doc.data().type || "EXPENSE",
        }));

        console.log("Categorias vindas do Firebase:", list);
        setCategories(list);
      },
      (error) => {
        console.error("Erro ao ler do Firebase:", error);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubRooms = onSnapshot(collection(db, "rooms"), (s) => {
      const list = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRooms(list);
    });
    const unsubP = onSnapshot(collection(db, "properties"), (s) =>
      setProperties(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubB = onSnapshot(collection(db, "duo_banks"), (s) =>
      setDuoBanks(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubH = onSnapshot(collection(db, "bank_history"), (s) =>
      setBankHistory(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubIncomes = onSnapshot(collection(db, "incomes"), (snapshot) => {
      setIncomes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsubRooms();
      unsubExpenses();
      unsubIncomes();
    };
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubU = onSnapshot(collection(db, "users"), (s) =>
      setUsersList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubF = onSnapshot(collection(db, "finances"), (s) =>
      setTransactions(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubC = onSnapshot(collection(db, "categories"), (s) =>
      setCategories(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const savedUid = localStorage.getItem("duogesto_uid");
    if (!savedUid) setAuthLoading(false);
    return () => {
      unsubU();
      unsubF();
      unsubC();
    };
  }, []);

  useEffect(() => {
    if (usersList.length > 0 && !userProfile) {
      const savedUid = localStorage.getItem("duogesto_uid");
      const found = usersList.find((u) => u.id === savedUid);
      if (found) setUserProfile(found);
      setAuthLoading(false);
    }
  }, [usersList, userProfile]);

  const [homeItems, setHomeItems] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const handleBuyItem = async (item) => {
    try {
      const itemRef = doc(db, "home_items", item.id);
      await updateDoc(itemRef, {
        bought: !item.bought,
      });
    } catch (e) {
      alert("Erro ao atualizar item: " + e.message);
    }
  };

  const ROOMS = [
    { id: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-600" },
    { id: "Quarto", icon: "🛏️", color: "bg-blue-100 text-blue-600" },
    { id: "Banheiro", icon: "🚿", color: "bg-cyan-100 text-cyan-600" },
    { id: "Sala", icon: "📺", color: "bg-purple-100 text-purple-600" },
    { id: "Lavanderia", icon: "🧺", color: "bg-emerald-100 text-emerald-600" },
    { id: "Outros", icon: "📦", color: "bg-slate-100 text-slate-600" },
  ];
  useEffect(() => {
    if (!db) return;
    const unsubH = onSnapshot(collection(db, "home_items"), (s) =>
      setHomeItems(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsubH();
  }, []);

  const report = useMemo(() => {
    if (!userProfile) return null;

    const dataCorteStr = userProfile.accountingStartDate || "2000-01-01";
    const dataContabil = new Date(dataCorteStr + "T12:00:00");
    const idsCasal = [userProfile.id];
    if (userProfile.partnerId) idsCasal.push(userProfile.partnerId);

    const getStatsParaMes = (mesRef, anoRef, listaIds) => {
      const primeiroDia = new Date(anoRef, mesRef, 1);
      const ultimoDia = new Date(anoRef, mesRef, 31);

      const transacoesDoMes = transactions.filter((trans) => {
        const dTrans = new Date(trans.date + "T12:00:00");
        if (!listaIds.includes(trans.userId) || dTrans < dataContabil)
          return false;

        if (trans.recurrence === "FIXED") return dTrans <= ultimoDia;
        if (trans.recurrence === "DURATION") {
          const dFim = new Date(trans.endDate + "T12:00:00");
          return dTrans <= ultimoDia && dFim >= primeiroDia;
        }
        return dTrans.getMonth() === mesRef && dTrans.getFullYear() === anoRef;
      });

      const ganhos = transacoesDoMes
        .filter((t) => t.type === "GAIN")
        .reduce((acc, b) => acc + Number(b.value), 0);
      const gastos = transacoesDoMes
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, b) => acc + Number(b.value), 0);

      return { ganhos, gastos, saldo: ganhos - gastos, trans: transacoesDoMes };
    };

    let acumuladoPassado = 0;
    let cursorData = new Date(dataContabil);
    cursorData.setDate(1);
    const dataVisaoAtual = new Date(
      currentFilterDate.getFullYear(),
      currentFilterDate.getMonth(),
      1
    );

    while (cursorData < dataVisaoAtual) {
      const statsPassado = getStatsParaMes(
        cursorData.getMonth(),
        cursorData.getFullYear(),
        idsCasal
      );
      acumuladoPassado += statsPassado.saldo;
      cursorData.setMonth(cursorData.getMonth() + 1);
    }

    const statsAtual = getStatsParaMes(
      currentFilterDate.getMonth(),
      currentFilterDate.getFullYear(),
      idsCasal
    );

    const dadosGraficoPizza = categories
      .map((categoriaItem) => ({
        name: categoriaItem.label || categoriaItem.name,
        value: statsAtual.trans
          .filter(
            (t) => t.category === categoriaItem.id && t.type === "EXPENSE"
          )
          .reduce((acc, b) => acc + Number(b.value), 0),
        color: categoriaItem.color,
      }))
      .filter((itemGraf) => itemGraf.value > 0);

    return {
      duoIncome: statsAtual.ganhos,
      duoExpense: statsAtual.gastos,
      duoBalance: statsAtual.saldo,
      accumulated: acumuladoPassado + statsAtual.saldo,
      currentTransactions: statsAtual.trans,
      chartData: dadosGraficoPizza,
    };
  }, [transactions, userProfile, currentFilterDate, categories]);

  // --- HANDLERS ---
  const handleSaveUser = async (uData, id) => {
    try {
      const batch = writeBatch(db);
      const ref = id ? doc(db, "users", id) : doc(collection(db, "users"));
      if (id) batch.update(ref, uData);
      else {
        const pass = await hashPassword("Duo#123");
        batch.set(ref, {
          ...uData,
          password: pass,
          createdAt: new Date().toISOString(),
        });
      }
      if (uData.partnerId)
        batch.update(doc(db, "users", uData.partnerId), {
          partnerId: id || ref.id,
        });
      await batch.commit();
      setShowUserModal(false);
    } catch (e) {
      alert(e.message);
    }
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-950 text-white font-black animate-pulse">
        DUOGESTO
      </div>
    );
  if (!userProfile)
    return <LoginScreen onLogin={setUserProfile} usersList={usersList} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar
        view={view}
        setView={setView}
        userProfile={userProfile}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* HEADER MOBILE */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-2 text-left">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Home size={18} />
            </div>
            <h2 className="font-black text-lg tracking-tighter uppercase text-slate-800 leading-none">
              DuoGesto
            </h2>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-slate-100 rounded-xl text-slate-600"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 bg-slate-50 scroll-smooth">
          <div className="w-full max-w-7xl mx-auto flex flex-col">
            {/* NAVEGAÇÃO DE DATAS */}
            {(view === "dashboard" || view === "finances") && (
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 text-left">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-800 leading-none">
                    {view === "dashboard" ? "DuoDashboard" : "Minhas Finanças"}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                      <Calendar size={14} />
                    </div>
                    <span className="text-xs font-black uppercase text-emerald-600 tracking-[0.15em]">
                      {getMonthName(currentFilterDate)}{" "}
                      {currentFilterDate.getFullYear()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                  <button
                    onClick={() =>
                      setCurrentFilterDate(
                        new Date(
                          currentFilterDate.setMonth(
                            currentFilterDate.getMonth() - 1
                          )
                        )
                      )
                    }
                    className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex flex-col items-center px-4 w-32 border-x border-slate-100 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest leading-tight">
                      Navegar
                    </span>
                    <span className="text-xs font-black text-slate-700 capitalize">
                      {getMonthName(currentFilterDate)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentFilterDate(
                        new Date(
                          currentFilterDate.setMonth(
                            currentFilterDate.getMonth() + 1
                          )
                        )
                      )
                    }
                    className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </header>
            )}
            {/* --- VIEW: DASHBOARD PREMIUM ATUALIZADA --- */}
            {view === "dashboard" &&
              (() => {
                const mesF = currentFilterDate.getMonth();
                const anoF = currentFilterDate.getFullYear();
                const dataLimiteFiltro = new Date(
                  anoF,
                  mesF + 1,
                  0,
                  23,
                  59,
                  59
                );

                const startingDate = resetMonth
                  ? new Date(
                      parseInt(resetMonth.split("-")[0]),
                      parseInt(resetMonth.split("-")[1]),
                      1
                    )
                  : new Date(2000, 0, 1);

                // 1. CÁLCULO ACUMULADO (SALDO GERAL)
                const totalInAcumulado = (incomes || [])
                  .filter((r) => {
                    const dR = new Date(r.date || r.createdAt);
                    return dR >= startingDate && dR <= dataLimiteFiltro;
                  })
                  .reduce((acc, r) => {
                    const dR = new Date(r.date || r.createdAt);
                    const baseCalculo = dR < startingDate ? startingDate : dR;
                    const diffM =
                      anoF * 12 +
                      mesF -
                      (baseCalculo.getFullYear() * 12 + baseCalculo.getMonth());
                    if (r.type === "fixed")
                      return acc + Number(r.amount) * (diffM + 1);
                    if (r.type === "period")
                      return (
                        acc +
                        Number(r.amount) *
                          Math.min(diffM + 1, Number(r.totalMonths))
                      );
                    return acc + Number(r.amount);
                  }, 0);

                const totalOutAcumulado = (expenses || [])
                  .filter((e) => {
                    const dE = new Date(e.startDate || e.createdAt);
                    return dE >= startingDate && dE <= dataLimiteFiltro;
                  })
                  .reduce((acc, e) => {
                    const dE = new Date(e.startDate || e.createdAt);
                    const baseCalculo = dE < startingDate ? startingDate : dE;
                    const diffM =
                      anoF * 12 +
                      mesF -
                      (baseCalculo.getFullYear() * 12 + baseCalculo.getMonth());
                    if (e.isFixed || e.type === "fixed")
                      return acc + Number(e.amount) * (diffM + 1);
                    if (e.isInstallment || e.type === "installment") {
                      const vUnit =
                        Number(e.amount) / Number(e.totalInstallments || 1);
                      return (
                        acc +
                        vUnit * Math.min(diffM + 1, Number(e.totalInstallments))
                      );
                    }
                    return acc + Number(e.amount);
                  }, 0);

                const saldoLiquidoTotal = totalInAcumulado - totalOutAcumulado;

                // 2. CÁLCULO MENSAL (PARA OS CARDS E GRÁFICO)
                const totalInMes = (incomes || [])
                  .filter((r) => {
                    const dR = new Date(r.date || r.createdAt);
                    const diff =
                      anoF * 12 +
                      mesF -
                      (dR.getFullYear() * 12 + dR.getMonth());
                    return (
                      (dR.getMonth() === mesF && dR.getFullYear() === anoF) ||
                      r.type === "fixed" ||
                      (r.type === "period" && diff >= 0 && diff < r.totalMonths)
                    );
                  })
                  .reduce((s, r) => s + Number(r.amount), 0);

                const totalOutMes = (expenses || [])
                  .filter((e) => {
                    const dE = new Date(e.startDate || e.createdAt);
                    const diff =
                      anoF * 12 +
                      mesF -
                      (dE.getFullYear() * 12 + dE.getMonth());
                    return (
                      diff >= 0 &&
                      (e.isFixed ||
                        (e.isInstallment && diff < e.totalInstallments) ||
                        diff === 0)
                    );
                  })
                  .reduce(
                    (s, e) =>
                      s +
                      (e.isInstallment
                        ? Number(e.amount) / Number(e.totalInstallments)
                        : Number(e.amount)),
                    0
                  );

                const diferencaMes = totalInMes - totalOutMes;
                const metaValorLimite = totalInMes * (metaPercent / 100);

                // 3. DADOS DO GRÁFICO (GASTOS POR CATEGORIA DO MÊS)
                const chartData = (categories || [])
                  .map((c) => {
                    const val = (expenses || [])
                      .filter((e) => {
                        const dR = new Date(e.startDate || e.createdAt);
                        const diff =
                          anoF * 12 +
                          mesF -
                          (dR.getFullYear() * 12 + dR.getMonth());
                        return (
                          e.category === (c.label || c.name) &&
                          diff >= 0 &&
                          (e.isFixed ||
                            (e.isInstallment && diff < e.totalInstallments) ||
                            diff === 0)
                        );
                      })
                      .reduce(
                        (a, b) =>
                          a +
                          (b.isInstallment
                            ? Number(b.amount) / Number(b.totalInstallments)
                            : Number(b.amount)),
                        0
                      );
                    return {
                      name: c.label || c.name,
                      value: val,
                      color: c.color || "#cbd5e1",
                    };
                  })
                  .filter((i) => i.value > 0);

                return (
                  <div className="space-y-6 pb-24 text-left animate-in fade-in duration-500">
                    {/* CABEÇALHO */}
                    <div className="flex justify-between items-center px-4">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                        Dashboard Duo
                      </h2>
                      {resetMonth && (
                        <button
                          onClick={() => setResetMonth(null)}
                          className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-4 py-2 rounded-full border border-rose-100"
                        >
                          🚫 Restaurar Saldo Original
                        </button>
                      )}
                    </div>

                    {/* CARD PRINCIPAL - SALDO E DIFERENÇA */}
                    <div className="bg-[#0D4233] p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">
                          Saldo Líquido Acumulado
                        </p>
                        <h3 className="text-6xl font-black tracking-tighter mb-10">
                          {formatCurrency(saldoLiquidoTotal)}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <div className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <p className="text-[9px] font-black uppercase opacity-50 mb-1">
                              Ganhos (Mês)
                            </p>
                            <p className="text-xl font-black text-emerald-400">
                              +{formatCurrency(totalInMes)}
                            </p>
                          </div>
                          <div className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <p className="text-[9px] font-black uppercase opacity-50 mb-1">
                              Gastos (Mês)
                            </p>
                            <p className="text-xl font-black text-rose-400">
                              -{formatCurrency(totalOutMes)}
                            </p>
                          </div>
                          <div className="bg-white/20 p-5 rounded-3xl border border-white/10 backdrop-blur-sm ring-1 ring-white/10">
                            <p className="text-[9px] font-black uppercase opacity-60 mb-1">
                              Diferença (Mês)
                            </p>
                            <p
                              className={`text-xl font-black ${
                                diferencaMes >= 0
                                  ? "text-emerald-300"
                                  : "text-rose-300"
                              }`}
                            >
                              {diferencaMes >= 0 ? "+" : ""}
                              {formatCurrency(diferencaMes)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-lg transition-all"
                          >
                            Guardar Reserva
                          </button>
                          {!resetMonth && (
                            <button
                              onClick={() => setResetMonth(`${anoF}-${mesF}`)}
                              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase border border-white/20"
                            >
                              Zerar neste mês
                            </button>
                          )}
                        </div>
                      </div>
                      <Wallet
                        size={180}
                        className="absolute -right-12 -bottom-12 opacity-10 rotate-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CARD META */}
                      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-10">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                              Meta de Gastos
                            </p>
                            <h4 className="text-xl font-black text-slate-800">
                              Lim: {formatCurrency(metaValorLimite)}
                            </h4>
                          </div>
                          <div
                            className={`px-4 py-1.5 rounded-xl font-black text-[9px] uppercase ${
                              totalOutMes > metaValorLimite
                                ? "bg-rose-100 text-rose-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {totalOutMes > metaValorLimite ? "Excedido" : "OK"}
                          </div>
                        </div>
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-6">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              totalOutMes > metaValorLimite
                                ? "bg-rose-500"
                                : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (totalOutMes / (metaValorLimite || 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase text-center">
                          {Math.round((totalOutMes / metaValorLimite) * 100)}%
                          consumido do limite
                        </p>
                      </div>

                      {/* CARD GRÁFICO MELHORADO */}
                      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase self-start mb-6">
                          Distribuição por Categoria
                        </p>
                        <div className="h-[250px] w-full">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v) => formatCurrency(v)}
                                  contentStyle={{
                                    borderRadius: "15px",
                                    border: "none",
                                    fontWeight: "bold",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase">
                              Sem gastos no mês
                            </div>
                          )}
                        </div>
                        {/* LEGENDA DO GRÁFICO */}
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                          {chartData.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: item.color }}
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            {view === "duo_bank" &&
              (() => {
                const now = new Date();
                const currentMonthHistory = (bankHistory || []).filter((h) => {
                  const d = new Date(h.date);
                  return (
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                  );
                });
                const totalDepositedThisMonth = currentMonthHistory
                  .filter((h) => h.amount > 0)
                  .reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
                const grandTotalAcumulado = (duoBanks || []).reduce(
                  (acc, b) => acc + (Number(b.currentAmount) || 0),
                  0
                );

                return (
                  <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left relative z-10">
                    {/* HEADER PRINCIPAL */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6 relative z-20">
                      <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                          DuoBank
                        </h2>
                        <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">
                          Nossas Reservas e Metas
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingBank(null);
                          setShowBankModal(true);
                        }}
                        className="bg-[#0D4233] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-[#082F25] transition-all"
                      >
                        <Plus size={18} /> Nova Conta/Meta
                      </button>
                    </header>

                    {/* DASHBOARD DE RESUMO GERAL */}
                    <div className="bg-[#0D4233] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
                        <div className="w-full md:w-auto">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">
                            Montante Total Acumulado
                          </p>
                          <p className="text-5xl font-black tracking-tighter">
                            {formatCurrency(grandTotalAcumulado)}
                          </p>
                        </div>
                        <div className="md:text-right flex flex-col md:items-end w-full md:w-auto">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A7D] mb-2">
                            Aporte Realizado (Este Mês)
                          </p>
                          <p className="text-3xl font-black tracking-tighter">
                            {formatCurrency(totalDepositedThisMonth)}
                          </p>
                        </div>
                      </div>
                      <Wallet
                        size={120}
                        className="absolute -left-8 -bottom-8 opacity-10 transform -rotate-12"
                      />
                    </div>

                    {/* GRID DE CARDS DE CONTAS/METAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(duoBanks || []).map((bank) => {
                        const progress =
                          bank.goalAmount > 0
                            ? Math.min(
                                Math.round(
                                  (bank.currentAmount / bank.goalAmount) * 100
                                ),
                                100
                              )
                            : 0;

                        const cardMonthDeposit = currentMonthHistory
                          .filter((h) => h.bankId === bank.id && h.amount > 0)
                          .reduce((acc, h) => acc + (Number(h.amount) || 0), 0);

                        return (
                          <div
                            key={bank.id}
                            className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group"
                          >
                            {/* BOTÕES DE CONFIGURAÇÃO DO CARD */}
                            <div className="flex justify-between items-start mb-6 text-left relative z-20">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0D4233] shadow-inner group-hover:bg-[#fdf4f1] transition-colors">
                                  <Library size={24} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-slate-800 leading-none mb-1">
                                    {bank.title}
                                  </h3>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {bank.bankName} • {bank.accountInfo}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingBank(bank);
                                    setShowBankModal(true);
                                  }}
                                  className="p-2 text-slate-300 hover:text-blue-500 transition-colors bg-slate-50 rounded-xl"
                                >
                                  <Settings size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Apagar esta meta?"))
                                      deleteDoc(doc(db, "duo_banks", bank.id));
                                  }}
                                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>

                            {/* BOTÃO PRINCIPAL DE MOVIMENTAÇÃO */}
                            <button
                              onClick={() => {
                                setSelectedBankForDeposit(bank);
                                setShowDepositModal(true);
                              }}
                              className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2 mb-6 shadow-sm"
                            >
                              <Zap size={14} fill="currentColor" /> Movimentar
                              Valor (Depósito/Retirada)
                            </button>

                            {/* INFOS DE APORTE E RESPONSÁVEL */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                  Responsável
                                </p>
                                <p className="text-xs font-black text-[#0D4233] uppercase">
                                  {bank.responsible}
                                </p>
                              </div>
                              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-widest">
                                  Aporte no Mês
                                </p>
                                <p className="text-sm font-black text-emerald-700">
                                  {formatCurrency(cardMonthDeposit)}
                                </p>
                              </div>
                            </div>

                            {/* BARRA DE PROGRESSO DUOGESTO */}
                            <div className="space-y-3 mt-auto mb-8">
                              <div className="flex justify-between items-end">
                                <div className="text-left">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    Guardado
                                  </p>
                                  <p className="text-lg font-black text-slate-800 leading-none">
                                    {formatCurrency(bank.currentAmount)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    Objetivo
                                  </p>
                                  <p className="text-sm font-black text-slate-500 leading-none">
                                    {formatCurrency(bank.goalAmount)}
                                  </p>
                                </div>
                              </div>
                              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-[#B88A7D] to-[#0D4233] rounded-full transition-all duration-1000 shadow-md"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-right text-[10px] font-black text-[#0D4233] uppercase tracking-widest">
                                {progress}% completo
                              </p>
                            </div>

                            {/* HISTÓRICO DE MOVIMENTAÇÕES COM ESTORNO */}
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                                Histórico Recente
                              </p>
                              {(bankHistory || [])
                                .filter((h) => h.bankId === bank.id)
                                .sort(
                                  (a, b) => new Date(b.date) - new Date(a.date)
                                )
                                .slice(0, 4)
                                .map((h) => (
                                  <div
                                    key={h.id}
                                    className="group/hist flex flex-col bg-slate-50/70 p-3 rounded-2xl relative border border-transparent hover:border-slate-100 transition-all"
                                  >
                                    <div className="flex justify-between items-center text-[10px]">
                                      <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-500 uppercase text-[9px]">
                                            {new Date(
                                              h.date
                                            ).toLocaleDateString("pt-BR")}
                                          </span>
                                          <span className="text-[8px] font-bold text-slate-300 px-1.5 py-0.5 bg-white rounded border border-slate-100">
                                            {h.user?.split(" ")[0]}
                                          </span>
                                        </div>
                                        {h.reason && (
                                          <span className="text-[9px] text-slate-400 italic font-medium mt-1 leading-tight">
                                            💬 {h.reason}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`font-black text-sm tracking-tighter ${
                                            h.amount < 0
                                              ? "text-rose-500"
                                              : "text-emerald-600"
                                          }`}
                                        >
                                          {h.amount < 0 ? "-" : "+"}{" "}
                                          {formatCurrency(Math.abs(h.amount))}
                                        </span>

                                        {/* BOTÃO DE APAGAR REGISTRO (ESTORNO) */}
                                        <button
                                          onClick={async () => {
                                            if (
                                              confirm(
                                                "Deseja estornar esta movimentação? O saldo da conta será ajustado automaticamente."
                                              )
                                            ) {
                                              try {
                                                await deleteDoc(
                                                  doc(db, "bank_history", h.id)
                                                );
                                                await updateDoc(
                                                  doc(db, "duo_banks", bank.id),
                                                  {
                                                    currentAmount:
                                                      Number(
                                                        bank.currentAmount
                                                      ) - Number(h.amount),
                                                  }
                                                );
                                              } catch (e) {
                                                alert("Erro ao estornar.");
                                              }
                                            }
                                          }}
                                          className="opacity-0 group-hover/hist:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all hover:bg-white rounded-lg"
                                          title="Apagar e estornar saldo"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {(!bankHistory ||
                                bankHistory.filter((h) => h.bankId === bank.id)
                                  .length === 0) && (
                                <p className="text-[9px] text-slate-300 italic py-2">
                                  Nenhuma movimentação registrada.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            {view === "properties" && (
              <div className="space-y-8 animate-in fade-in pb-20 text-left">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                      Moradia
                    </h2>
                    <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      Encontre o lar ideal
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProperty(null);
                      setShowPropertyModal(true);
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    <Plus size={18} /> Adicionar Opção
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((p) => {
                    const isFavoritedByMe = p.favorites?.includes(
                      userProfile.name
                    );
                    const totalCost =
                      Number(p.price || 0) +
                      (p.hasCondo ? Number(p.condoValue || 0) : 0);

                    const toggleFavorite = async () => {
                      const newFavorites = isFavoritedByMe
                        ? p.favorites.filter(
                            (name) => name !== userProfile.name
                          )
                        : [...(p.favorites || []), userProfile.name];
                      await updateDoc(doc(db, "properties", p.id), {
                        favorites: newFavorites,
                      });
                    };

                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-[3rem] p-8 border-2 shadow-sm flex flex-col transition-all group relative ${
                          p.isPenthouse
                            ? "border-purple-400 bg-purple-50/20"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        {/* Banner de Cobertura */}
                        {p.isPenthouse && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                            ✨ Cobertura
                          </div>
                        )}

                        {/* Tags e Ações Superiores */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                              {p.subType === "CASA"
                                ? "🏠 Casa"
                                : "🏢 Apartamento"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                p.type === "RENT"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-emerald-100 text-emerald-600"
                              }`}
                            >
                              {p.type === "RENT" ? "Aluguel" : "Compra"}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={toggleFavorite}
                              className={`p-2 rounded-xl transition-all ${
                                isFavoritedByMe
                                  ? "text-rose-500 bg-rose-50"
                                  : "text-slate-300 hover:text-rose-400"
                              }`}
                            >
                              <Heart
                                size={20}
                                fill={isFavoritedByMe ? "currentColor" : "none"}
                              />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProperty(p);
                                setShowPropertyModal(true);
                              }}
                              className="p-2 text-slate-300 hover:text-blue-500"
                            >
                              <Settings size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Apagar?"))
                                  deleteDoc(doc(db, "properties", p.id));
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Título e Local */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                            {p.neighborhood}
                          </h3>
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            {p.city}
                          </p>
                        </div>

                        {/* FICHA TÉCNICA (ÍCONES) */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-xl">
                            <BedDouble size={14} className="text-slate-400" />
                            <span className="text-[11px] font-black">
                              {p.rooms} {p.rooms > 1 ? "Quartos" : "Quarto"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-xl">
                            <Bath size={14} className="text-slate-400" />
                            <span className="text-[11px] font-black">
                              {p.bathrooms}{" "}
                              {p.bathrooms > 1 ? "Banheiros" : "Banheiro"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-xl">
                            <Car size={14} className="text-slate-400" />
                            <span className="text-[11px] font-black">
                              {p.garage} {p.garage > 1 ? "Vagas" : "Vaga"}
                            </span>
                          </div>
                          {p.hasBalcony && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                              <Waves size={14} />
                              <span className="text-[9px] font-black uppercase">
                                Varanda
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Custos Detalhados */}
                        <div className="space-y-2 mb-6 text-xs font-bold text-slate-500 border-t border-slate-50 pt-4">
                          <div className="flex justify-between">
                            <span>Aluguel</span>
                            <span>{formatCurrency(p.price)}</span>
                          </div>
                          {p.hasCondo && (
                            <>
                              <div className="flex justify-between">
                                <span>Condomínio</span>
                                <span>{formatCurrency(p.condoValue)}</span>
                              </div>
                              {p.condoIncludes && (
                                <div className="p-2 bg-slate-50 rounded-lg text-[9px] italic leading-tight text-slate-400">
                                  Inclui: {p.condoIncludes}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* VALOR TOTAL EM DESTAQUE */}
                        <div
                          className={`${
                            p.isPenthouse
                              ? "bg-purple-900 shadow-purple-200"
                              : "bg-slate-900 shadow-slate-200"
                          } rounded-[2rem] p-6 text-white shadow-xl mb-6 relative overflow-hidden`}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1 opacity-80">
                            Custo Total Previsto
                          </p>
                          <p className="text-3xl font-black tracking-tighter">
                            {formatCurrency(totalCost)}
                            {p.type === "RENT" && (
                              <span className="text-xs opacity-50 ml-1">
                                /mês
                              </span>
                            )}
                          </p>
                          <Wallet
                            size={60}
                            className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12"
                          />
                        </div>

                        {/* RODAPÉ: FAVORITOS E QUEM ADICIONOU */}
                        <div className="mt-auto space-y-4">
                          {/* Balões de Favoritos */}
                          <div className="flex flex-wrap gap-2">
                            {p.favorites?.length > 0 &&
                              p.favorites.map((name) => (
                                <span
                                  key={name}
                                  className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase border border-rose-100"
                                >
                                  <Heart size={10} fill="currentColor" />{" "}
                                  {name.split(" ")[0]}
                                </span>
                              ))}
                          </div>

                          {/* Info de Adição e Botão de Link */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white shadow-sm">
                                {p.addedBy?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">
                                  Encontrado por
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase leading-none">
                                  {p.addedBy?.split(" ")[0]}
                                </span>
                              </div>
                            </div>

                            <a
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:scale-110 active:scale-95"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* --- VIEW: FINANÇAS COMPLETA COM EDIÇÃO E EXCLUSÃO --- */}
            {view === "finances" &&
              (() => {
                const mesF = currentFilterDate.getMonth();
                const anoF = currentFilterDate.getFullYear();

                // 1. FILTRAGEM DE RECEITAS (Mensal + Recorrentes)
                const receitasFiltradas = (incomes || []).filter((r) => {
                  const dRef = new Date(r.date || r.createdAt);
                  const diffM =
                    anoF * 12 +
                    mesF -
                    (dRef.getFullYear() * 12 + dRef.getMonth());
                  if (diffM < 0) return false;
                  if (r.type === "fixed") return true;
                  if (r.type === "period")
                    return diffM < (Number(r.totalMonths) || 1);
                  return diffM === 0;
                });

                // 2. FILTRAGEM DE DESPESAS (Mensal + Parcelas + Fixas)
                const despesasFiltradas = (expenses || []).filter((e) => {
                  const dRef = new Date(e.startDate || e.createdAt);
                  const diffM =
                    anoF * 12 +
                    mesF -
                    (dRef.getFullYear() * 12 + dRef.getMonth());
                  if (diffM < 0) return false;
                  if (e.isFixed || e.type === "fixed") return true;
                  if (e.isInstallment || e.type === "installment")
                    return diffM < (Number(e.totalInstallments) || 1);
                  return diffM === 0;
                });

                const totalRecParaMeta = receitasFiltradas.reduce(
                  (s, i) => s + (Number(i.amount) || 0),
                  0
                );

                return (
                  <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-left">
                    {/* PAINEL DE META DINÂMICA */}
                    <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex flex-col gap-6 shadow-sm">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg">
                            <Target size={24} />
                          </div>
                          <div>
                            <p className="text-emerald-900 font-black text-sm uppercase tracking-tighter leading-none">
                              Configuração de Meta
                            </p>
                            <p className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                              Limite de gastos para o Duo
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 w-full md:w-auto">
                          <input
                            type="range"
                            min="5"
                            max="95"
                            step="5"
                            value={metaPercent}
                            onChange={(e) =>
                              setMetaPercent(Number(e.target.value))
                            }
                            className="accent-emerald-600 h-2 w-32 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-black text-sm min-w-[55px] text-center">
                            {metaPercent}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">
                            Limite de Gastos
                          </p>
                          <p className="text-lg font-black text-rose-500">
                            {formatCurrency(
                              totalRecParaMeta * (metaPercent / 100)
                            )}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">
                            Reserva Esperada
                          </p>
                          <p className="text-lg font-black text-emerald-600">
                            {formatCurrency(
                              totalRecParaMeta * (1 - metaPercent / 100)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CABEÇALHO E AÇÕES */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                      <div className="w-full text-left">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                          Fluxo de Caixa
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                          {getMonthName(currentFilterDate)}{" "}
                          {currentFilterDate.getFullYear()}
                        </p>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button
                          onClick={() => setIsIncomeModalOpen(true)}
                          className="flex-1 md:flex-none bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-200 transition-all"
                        >
                          + Receita
                        </button>
                        <button
                          onClick={() => setIsExpenseModalOpen(true)}
                          className="flex-1 md:flex-none bg-rose-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-rose-700 transition-all"
                        >
                          - Despesa
                        </button>
                      </div>
                    </div>

                    {/* LISTA DE RECEITAS */}
                    <section className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
                        Entradas do Mês
                      </p>
                      {receitasFiltradas.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-black uppercase text-[9px]">
                          Sem receitas
                        </div>
                      ) : (
                        receitasFiltradas.map((r) => (
                          <div
                            key={r.id}
                            className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={20} />
                              </div>
                              <div>
                                <p className="font-black text-slate-800 uppercase text-sm mb-1 leading-none">
                                  {r.description}
                                </p>
                                <div className="flex gap-2">
                                  <span className="text-[8px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-black uppercase">
                                    {r.type === "fixed" ? "Fixo" : "Único"}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-300 uppercase">
                                    {r.user}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-emerald-600 text-base mr-2">
                                {formatCurrency(r.amount)}
                              </p>
                              <button
                                onClick={() => setEditingIncome(r)}
                                className="p-2 text-slate-200 hover:text-emerald-500 transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Excluir receita?"))
                                    deleteDoc(doc(db, "incomes", r.id));
                                }}
                                className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </section>

                    {/* LISTA DE DESPESAS */}
                    <section className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
                        Saídas e Parcelas
                      </p>
                      {despesasFiltradas.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-black uppercase text-[9px]">
                          Sem gastos
                        </div>
                      ) : (
                        despesasFiltradas.map((e) => {
                          const dRef = new Date(e.startDate || e.createdAt);
                          const numParcela =
                            anoF * 12 +
                            mesF -
                            (dRef.getFullYear() * 12 + dRef.getMonth()) +
                            1;
                          const isPaid = e.payments?.some(
                            (p) => p.installment === numParcela
                          );
                          const valorExibicao =
                            e.isInstallment || e.type === "installment"
                              ? Number(e.amount) /
                                (Number(e.totalInstallments) || 1)
                              : Number(e.amount);

                          return (
                            <div
                              key={e.id}
                              className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm group"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <button
                                  onClick={() => setShowPaymentModal(e)}
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    isPaid
                                      ? "bg-emerald-50 text-emerald-500"
                                      : "bg-slate-50 text-slate-300"
                                  }`}
                                >
                                  {isPaid ? (
                                    <CheckCircle size={22} />
                                  ) : (
                                    <Calendar size={22} />
                                  )}
                                </button>
                                <div>
                                  <p
                                    className={`font-black text-sm uppercase mb-1 leading-none ${
                                      isPaid
                                        ? "text-slate-400"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {e.description}
                                  </p>
                                  <div className="flex gap-2">
                                    <span className="text-[8px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-black uppercase">
                                      {e.isInstallment
                                        ? `Parc. ${numParcela}/${e.totalInstallments}`
                                        : e.isFixed
                                        ? "Fixo"
                                        : "Único"}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase">
                                      {e.user}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                  <p
                                    className={`font-black text-base ${
                                      isPaid
                                        ? "text-slate-300"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {formatCurrency(valorExibicao)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setEditingExpense(e)}
                                  className="p-2 text-slate-200 hover:text-emerald-500 transition-colors"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Excluir despesa?"))
                                      deleteDoc(doc(db, "expenses", e.id));
                                  }}
                                  className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </section>
                  </div>
                );
              })()}
            {/* --- VIEW: ADMIN USERS --- */}
            {view === "admin_users" && userProfile.role === "ADMIN" && (
              <div className="space-y-6 text-left animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                      Gerenciar Duo
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Membros e acessos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setShowUserModal(true);
                    }}
                    className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2"
                  >
                    <UserPlus size={18} /> Novo Membro
                  </button>
                </div>
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-50">
                        <th className="pb-6 px-4">Membro</th>
                        <th className="pb-6 text-center">Nível</th>
                        <th className="pb-6 text-center">Vínculo Duo</th>
                        <th className="pb-6 text-right px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          className="text-sm hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                                {u.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700">
                                  {u.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold">
                                  @{u.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-center">
                            <span
                              className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                u.role === "ADMIN"
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-emerald-100 text-emerald-600"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-5 text-center font-bold text-slate-500">
                            {u.partnerId ? (
                              <div className="flex items-center justify-center gap-1.5 text-rose-500">
                                <Heart size={12} fill="currentColor" />{" "}
                                {
                                  usersList
                                    .find((p) => p.id === u.partnerId)
                                    ?.name.split(" ")[0]
                                }
                              </div>
                            ) : (
                              <span className="text-slate-200">
                                Não vinculado
                              </span>
                            )}
                          </td>
                          <td className="py-5 text-right px-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowUserModal(true);
                                }}
                                className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"
                              >
                                <Settings size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- VIEW: CATEGORIES --- */}
            {view === "categories" && (
              <div className="space-y-6 text-left animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                      Minhas Categorias
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Organize seus fluxos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setShowCategoryModal(true);
                    }}
                    className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2"
                  >
                    <Plus size={18} /> Nova Categoria
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {["GAIN", "EXPENSE"].map((type) => (
                    <div key={type} className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        {type === "GAIN" ? "🟢 Entradas" : "🔴 Saídas"}
                      </p>
                      <div className="space-y-3">
                        {categories
                          .filter((c) => c.type === type)
                          .map((c) => (
                            <div
                              key={c.id}
                              className="bg-white p-4 rounded-[2rem] border border-slate-200 flex justify-between items-center"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                                  style={{
                                    backgroundColor: c.color + "20",
                                    color: c.color,
                                  }}
                                >
                                  {c.icon}
                                </div>
                                <p className="font-black text-slate-700">
                                  {c.label}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCategory(c);
                                    setShowCategoryModal(true);
                                  }}
                                  className="p-2 text-blue-500"
                                >
                                  <Settings size={18} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm("Apagar?"))
                                      await deleteDoc(
                                        doc(db, "categories", c.id)
                                      );
                                  }}
                                  className="p-2 text-rose-400"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* --- VIEW: HOME CONFIG --- */}
            {/* --- VIEW: HOME CONFIG (NOSSA CASA) --- */}
            {/* --- VIEW: HOME_CONFIG (NOSSA CASA) --- */}
            {view === "home_config" && (
              <div className="space-y-8 animate-in fade-in pb-20 text-left">
                {/* HEADER DA SEÇÃO */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                      Nossa Casa
                    </h2>
                    <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      Planejamento e Conquistas
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setShowRoomModal(true);
                    }}
                    className="bg-[#0D4233] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:opacity-90 transition-all"
                  >
                    <Plus size={18} /> Novo Cômodo
                  </button>
                </header>

                {/* RESUMO GERAL DA CASA (DASHBOARD) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card: Total Financeiro Pendente */}
                  <div className="bg-gradient-to-br from-[#0D4233] to-[#1a5d4a] rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-80 mb-2">
                        Total Pendente (Casa Toda)
                      </p>
                      <p className="text-4xl font-black tracking-tighter">
                        {formatCurrency(
                          homeItems
                            .filter((item) => !item.bought)
                            .reduce(
                              (acc, item) => acc + (Number(item.price) || 0),
                              0
                            )
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-4 opacity-60">
                        <Tag size={12} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          {homeItems.filter((i) => !i.bought).length} itens
                          aguardando compra
                        </p>
                      </div>
                    </div>
                    <Wallet
                      size={100}
                      className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12"
                    />
                  </div>

                  {/* Card: Progresso de Itens Adquiridos */}
                  <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-center text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      Conclusão do Projeto
                    </p>
                    <div className="flex items-end gap-4">
                      <p className="text-4xl font-black text-slate-800 tracking-tighter">
                        {homeItems.length > 0
                          ? Math.round(
                              (homeItems.filter((i) => i.bought).length /
                                homeItems.length) *
                                100
                            )
                          : 0}
                        %
                      </p>
                      <div className="flex-1 mb-2">
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{
                              width: `${
                                homeItems.length > 0
                                  ? (homeItems.filter((i) => i.bought).length /
                                      homeItems.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-slate-400">
                      <CheckCircle size={12} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        {homeItems.filter((i) => i.bought).length} de{" "}
                        {homeItems.length} itens conquistados
                      </p>
                    </div>
                  </div>
                </section>

                {/* GRID DE CÔMODOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => {
                    const roomItems = homeItems.filter(
                      (i) => i.room === room.id
                    );
                    const boughtItems = roomItems.filter((i) => i.bought);
                    const progress =
                      roomItems.length > 0
                        ? Math.round(
                            (boughtItems.length / roomItems.length) * 100
                          )
                        : 0;
                    const totalPending = roomItems
                      .filter((i) => !i.bought)
                      .reduce((acc, i) => acc + (Number(i.price) || 0), 0);

                    return (
                      <div
                        key={room.id}
                        className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col hover:border-[#B88A7D] transition-all group/room"
                      >
                        {/* Cabeçalho do Cômodo */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover/room:bg-[#fdf4f1] transition-colors">
                            {room.icon}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingRoom(room);
                                setShowRoomModal(true);
                              }}
                              className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Apagar cômodo?"))
                                  deleteDoc(doc(db, "rooms", room.id));
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                            {room.label}
                          </h3>
                          <p className="text-[#B88A7D] font-black text-lg">
                            {formatCurrency(totalPending)}
                          </p>
                        </div>

                        {/* Barra de Progresso Local */}
                        <div className="mb-6 space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-slate-400 tracking-widest">
                              Status
                            </span>
                            <span className="text-[#B88A7D]">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#B88A7D] transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Lista de Itens do Cômodo */}
                        <div className="space-y-2 mb-6 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                          {roomItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl group/item hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm"
                            >
                              {/* Link do Produto */}
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 overflow-hidden cursor-pointer"
                              >
                                <p
                                  className={`text-[11px] font-bold truncate ${
                                    item.bought
                                      ? "line-through opacity-30"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.name}
                                </p>
                                <p className="text-[10px] font-black text-[#B88A7D] flex items-center gap-1">
                                  {formatCurrency(item.price)}
                                  {!item.bought && item.link && (
                                    <ExternalLink
                                      size={10}
                                      className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    />
                                  )}
                                </p>
                              </a>

                              {/* Ações do Item */}
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleBuyItem(item);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    item.bought
                                      ? "bg-emerald-500 text-white"
                                      : "text-emerald-500 hover:bg-emerald-50"
                                  }`}
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (confirm("Excluir?"))
                                      deleteDoc(doc(db, "home_items", item.id));
                                  }}
                                  className="p-1.5 text-rose-300 hover:text-rose-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}

                          {roomItems.length === 0 && (
                            <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                Sem itens lançados
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Botão Adicionar Item */}
                        <button
                          onClick={() => {
                            setSelectedRoom(room.id);
                            setShowHomeModal(true);
                          }}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2 hover:bg-[#0D4233] transition-all mt-auto"
                        >
                          <Plus size={14} /> Adicionar Item
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAIS GLOBAIS */}
      {showDepositModal && (
        <QuickDepositModal
          bank={selectedBankForDeposit}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedBankForDeposit(null);
          }}
          userProfile={userProfile}
        />
      )}
      {showUserModal && (
        <UserModal
          user={editingUser}
          allUsers={usersList}
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}
      {showTransactionModal && (
        <TransactionModal
          onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
          userProfile={userProfile}
          editingTransaction={editingTransaction}
          categories={categories}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Modal de Usuário */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          allUsers={usersList}
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal DuoBank */}
      {showBankModal && (
        <DuoBankModal
          bank={editingBank}
          onClose={() => {
            setShowBankModal(false);
            setEditingBank(null);
          }}
          userProfile={userProfile}
          duoList={usersList}
        />
      )}

      {/* Modal Depósito Rápido */}
      {showDepositModal && (
        <QuickDepositModal
          bank={selectedBankForDeposit}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedBankForDeposit(null);
          }}
          userProfile={userProfile}
        />
      )}
      {showRoomModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => {
            setShowRoomModal(false);
            setEditingRoom(null);
          }}
        />
      )}
      {isTransferModalOpen && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          userProfile={userProfile}
          goals={duoBanks}
          onTransfer={async (goalId, val) => {
            const g = duoBanks.find((x) => x.id === goalId);

            // 1. Aumenta o valor na Reserva (DuoBank)
            await updateDoc(doc(db, "duo_banks", goalId), {
              currentAmount: Number(g.currentAmount) + val,
            });

            // 2. Cria uma "Despesa" automática para sair da conta corrente
            await addDoc(collection(db, "expenses"), {
              description: `Envio para Reserva: ${g.title}`,
              amount: val,
              category: "Investimentos", // Certifique-se que essa categoria existe
              type: "unique",
              isFixed: false,
              isInstallment: false,
              startDate: new Date().toISOString(),
              user: userProfile.name,
              payments: [{ installment: 1, date: new Date().toISOString() }], // Já marca como pago
              createdAt: new Date().toISOString(),
            });

            // 3. Registra no histórico do banco
            await addDoc(collection(db, "bank_history"), {
              bankId: goalId,
              amount: val,
              user: userProfile.name,
              reason: "Transferência Dashboard",
              date: new Date().toISOString(),
            });
          }}
        />
      )}
      {editingIncome && (
        <EditIncomeModal
          income={editingIncome}
          onClose={() => setEditingIncome(null)}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setEditingExpense(null)}
        />
      )}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        userProfile={userProfile}
        categories={categories} // <--- ISSO AQUI TEM QUE EXISTIR
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        userProfile={userProfile}
        categories={categories}
      />
      {showBankModal && (
        <DuoBankModal
          bank={editingBank}
          onClose={() => {
            setShowBankModal(false);
            setEditingBank(null);
          }}
          userProfile={userProfile}
          duoList={usersList}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          expense={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
          userProfile={userProfile}
        />
      )}
      {showHomeModal && (
        <HomeItemModal
          room={selectedRoom}
          onClose={() => {
            setShowHomeModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
      {/* Procure por esta parte no final do DuoGestoApp e substitua */}
      {showPropertyModal && (
        <PropertyModal
          property={editingProperty}
          userProfile={userProfile}
          onClose={() => {
            setShowPropertyModal(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}

// --- COMPONENTE: MODAL DE PAGAMENTO COM RESUMO DE DÍVIDA ---
function EditIncomeModal({ income, onClose }) {
  if (!income) return null;
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;
    try {
      await updateDoc(doc(db, "incomes", income.id), {
        description: f.description.value,
        amount: Number(f.amount.value),
        type: f.type.value,
      });
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tighter">
            Editar Receita
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="p-8 space-y-4 text-left">
          <input
            name="description"
            defaultValue={income.description}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold"
            placeholder="Descrição"
          />
          <input
            name="amount"
            type="number"
            step="0.01"
            defaultValue={income.amount}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-black text-xl"
          />
          <select
            name="type"
            defaultValue={income.type}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold"
          >
            <option value="unique">Único</option>
            <option value="fixed">Fixo</option>
          </select>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
function EditExpenseModal({ expense, categories, onClose }) {
  if (!expense) return null;
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;
    try {
      await updateDoc(doc(db, "expenses", expense.id), {
        description: f.description.value,
        amount: Number(f.amount.value),
        category: f.category.value,
      });
      onClose();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tighter">
            Editar Despesa
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="p-8 space-y-4 text-left">
          <input
            name="description"
            defaultValue={expense.description}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold"
          />
          <input
            name="amount"
            type="number"
            step="0.01"
            defaultValue={expense.amount}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-black text-xl"
          />
          <select
            name="category"
            defaultValue={expense.category}
            className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold"
          >
            {categories?.map((c) => (
              <option key={c.id} value={c.label || c.name}>
                {c.label || c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaymentModal({ expense, onClose, userProfile }) {
  if (!expense) return null;

  const totalParcelas = Number(expense.totalInstallments) || 1;
  const valorUnitario = Number(expense.amount) / totalParcelas;
  const installments = Array.from({ length: totalParcelas });

  const togglePayment = async (installmentNum) => {
    const currentPayments = expense.payments || [];
    const isAlreadyPaid = currentPayments.some(
      (p) => p.installment === installmentNum
    );

    let newPayments;
    if (isAlreadyPaid) {
      newPayments = currentPayments.filter(
        (p) => p.installment !== installmentNum
      );
    } else {
      newPayments = [
        ...currentPayments,
        {
          installment: installmentNum,
          paidAt: new Date().toISOString(),
          user: userProfile.name,
        },
      ];
    }

    try {
      await updateDoc(doc(db, "expenses", expense.id), {
        payments: newPayments,
      });
    } catch (e) {
      console.error("Erro ao atualizar:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-6 text-left">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
              Controle de Parcelas
            </p>
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter leading-none mb-4">
              {expense.description}
            </h2>

            <div className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Valor Parcela
                </p>
                <p className="text-rose-500 font-black text-xl leading-none">
                  {formatCurrency(valorUnitario)}
                </p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Dívida Total
                </p>
                <p className="text-slate-600 font-bold text-sm leading-none mt-1">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 p-3 rounded-2xl text-slate-400 hover:text-slate-600 ml-4"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 custom-scrollbar">
          {installments.map((_, i) => {
            const num = i + 1;
            const isPaid = expense.payments?.some((p) => p.installment === num);
            return (
              <button
                key={num}
                onClick={() => togglePayment(num)}
                className={`flex flex-col items-center justify-center p-4 rounded-[1.8rem] border-2 transition-all ${
                  isPaid
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner"
                    : "bg-slate-50 border-slate-100 text-slate-300 hover:border-emerald-200"
                }`}
              >
                <span className="text-[10px] font-black mb-1">{num}ª</span>
                {isPaid ? <CheckCircle size={20} /> : <Calendar size={20} />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <Info size={16} className="text-emerald-600 shrink-0" />
          <p className="text-[10px] font-medium text-emerald-800 leading-tight">
            Ao marcar uma parcela como paga, o valor de{" "}
            <strong>{formatCurrency(valorUnitario)}</strong> será abatido do seu
            Saldo Real na Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
function PropertyModal({ property, onClose, userProfile }) {
  const [loading, setLoading] = false;
  const [hasCondo, setHasCondo] = useState(property?.hasCondo || false);
  const [isPenthouse, setIsPenthouse] = useState(
    property?.isPenthouse || false
  );

  {
    /* --- COMPONENTE: MODAL DUOBANK (ADICIONAR / EDITAR) --- */
  }
  function DuoBankModal({ bank, onClose, userProfile, duoList }) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const f = e.target;

      const incomeData = {
        description,
        amount: Number(amount),
        user: userProfile.name,
        date: new Date().toISOString(),
        type: incomeType,
        totalMonths:
          incomeType === "period"
            ? Number(duration)
            : incomeType === "fixed"
            ? 999
            : 1,
        createdAt: serverTimestamp(),
      };

      // Organiza os dados para o Firebase
      const data = {
        title: f.title.value,
        bankName: f.bankName.value,
        accountInfo: f.accountInfo.value,
        responsible: f.responsible.value,
        currentAmount: Number(f.currentAmount.value),
        monthlyTarget: Number(f.monthlyTarget.value),
        goalAmount: Number(f.goalAmount.value),
        updatedAt: new Date().toISOString(),
      };

      try {
        if (bank?.id) {
          // MODO EDIÇÃO: Atualiza o documento existente
          await updateDoc(doc(db, "duo_banks", bank.id), data);
        } else {
          // MODO CRIAÇÃO: Adiciona um novo documento
          await addDoc(collection(db, "duo_banks"), {
            ...data,
            createdAt: new Date().toISOString(),
          });
        }
        onClose(); // Fecha o modal após sucesso
      } catch (err) {
        console.error("Erro ao salvar no DuoBank:", err);
        alert("Erro ao salvar: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
          {/* CABEÇALHO DO MODAL */}
          <div className="bg-[#0D4233] p-6 text-white flex justify-between items-center">
            <h3 className="font-black text-xl tracking-tighter uppercase">
              {bank ? "Editar Configurações" : "Nova Conta DuoBank"}
            </h3>
            <button
              onClick={onClose}
              className="hover:rotate-90 transition-transform p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* FORMULÁRIO */}
          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Nome da Meta / Reserva
              </label>
              <input
                name="title"
                required
                placeholder="Ex: Reserva de Emergência"
                defaultValue={bank?.title}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                  Banco
                </label>
                <input
                  name="bankName"
                  required
                  placeholder="Ex: Nubank"
                  defaultValue={bank?.bankName}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                  Conta/Agência
                </label>
                <input
                  name="accountInfo"
                  required
                  placeholder="Ex: 0001 / 123-4"
                  defaultValue={bank?.accountInfo}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Responsável no Duo
              </label>
              <select
                name="responsible"
                defaultValue={bank?.responsible || userProfile?.name}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D] appearance-none"
              >
                {duoList && duoList.length > 0 ? (
                  duoList.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))
                ) : (
                  <option value={userProfile?.name}>{userProfile?.name}</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                  Montante Guardado
                </label>
                <input
                  name="currentAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={bank?.currentAmount || 0}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                  Meta Final (Objetivo)
                </label>
                <input
                  name="goalAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={bank?.goalAmount || 0}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Aporte Mensal Planejado
              </label>
              <input
                name="monthlyTarget"
                type="number"
                step="0.01"
                required
                defaultValue={bank?.monthlyTarget || 0}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D4233] text-white py-5 rounded-[2rem] font-black uppercase shadow-lg hover:bg-[#082F25] transition-all disabled:opacity-50 mt-4"
            >
              {loading
                ? "Sincronizando..."
                : bank
                ? "Salvar Alterações"
                : "Criar Meta DuoBank"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- FUNÇÃO PARA DAR BAIXA NO PAGAMENTO ---
  const handlePayment = async (expense, installmentNumber, sourceBankId) => {
    const newPayments = [...(expense.payments || [])];

    const paymentData = {
      installment: installmentNumber,
      paid: true,
      paidAt: new Date().toISOString(),
      source: sourceBankId, // ID do Card do DuoBank ou 'corrente'
    };

    newPayments.push(paymentData);

    try {
      await updateDoc(doc(db, "expenses", expense.id), {
        payments: newPayments,
        // Se era a última parcela, marca a despesa toda como concluída
        completed: expense.isInstallment
          ? newPayments.length === expense.totalInstallments
          : true,
      });

      // Lógica de Abatimento no DuoBank (Se não for conta corrente)
      if (sourceBankId !== "corrente") {
        const bankRef = doc(db, "banks", sourceBankId);
        // Aqui você subtrai o valor do saldo do Card selecionado
      }

      alert("Pagamento registrado com sucesso!");
    } catch (e) {
      alert("Erro ao pagar: " + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      city: f.city.value,
      neighborhood: f.neighborhood.value,
      price: Number(f.price.value),
      type: f.type.value,
      subType: f.subType.value,
      rooms: Number(f.rooms.value),
      bathrooms: Number(f.bathrooms.value),
      garage: Number(f.garage.value),
      hasBalcony: f.hasBalcony.checked,
      isPenthouse: isPenthouse,
      link: f.link.value,
      hasCondo: hasCondo,
      condoValue: hasCondo ? Number(f.condoValue?.value || 0) : 0,
      condoIncludes: hasCondo ? f.condoIncludes?.value || "" : "",
      addedBy: property?.addedBy || userProfile?.name || "Usuário",
      favorites: property?.favorites || [],
      updatedAt: new Date().toISOString(),
    };

    try {
      if (property?.id)
        await updateDoc(doc(db, "properties", property.id), data);
      else
        await addDoc(collection(db, "properties"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left font-sans">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl">Detalhes do Imóvel</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          {/* Cidade e Bairro */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              required
              placeholder="Cidade"
              defaultValue={property?.city}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none"
            />
            <input
              name="neighborhood"
              required
              placeholder="Bairro"
              defaultValue={property?.neighborhood}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none"
            />
          </div>

          {/* Configuração do Imóvel */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Quartos
              </label>
              <input
                name="rooms"
                type="number"
                required
                defaultValue={property?.rooms || 1}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Banheiros
              </label>
              <input
                name="bathrooms"
                type="number"
                required
                defaultValue={property?.bathrooms || 1}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Vagas Garagem
              </label>
              <input
                name="garage"
                type="number"
                required
                defaultValue={property?.garage || 0}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold"
              />
            </div>
          </div>

          {/* Tipo, Negócio e Cobertura */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="subType"
              defaultValue={property?.subType || "APTO"}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none"
            >
              <option value="APTO">Apartamento</option>
              <option value="CASA">Casa</option>
            </select>
            <select
              name="type"
              defaultValue={property?.type || "RENT"}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none"
            >
              <option value="RENT">Aluguel</option>
              <option value="BUY">Compra</option>
            </select>
          </div>

          <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hasBalcony"
                defaultChecked={property?.hasBalcony}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="text-[10px] font-black uppercase text-slate-600">
                Varanda
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPenthouse}
                onChange={(e) => setIsPenthouse(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <span className="text-[10px] font-black uppercase text-slate-600">
                É Cobertura?
              </span>
            </label>
          </div>

          {/* Preço e Condomínio */}
          <input
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="Valor Base"
            defaultValue={property?.price}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none"
          />

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCondo}
                onChange={(e) => setHasCondo(e.target.checked)}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="font-black text-[10px] uppercase text-slate-600">
                Tem Condomínio
              </span>
            </label>
            {hasCondo && (
              <div className="space-y-3">
                <input
                  name="condoValue"
                  type="number"
                  step="0.01"
                  placeholder="Valor Condomínio"
                  defaultValue={property?.condoValue}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold"
                />
                <textarea
                  name="condoIncludes"
                  placeholder="Incluso no condomínio..."
                  defaultValue={property?.condoIncludes}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm h-16 resize-none"
                />
              </div>
            )}
          </div>

          <input
            name="link"
            type="url"
            required
            placeholder="Link do Anúncio"
            defaultValue={property?.link}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4"
          />

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-lg"
          >
            Salvar Imóvel
          </button>
        </form>
      </div>
    </div>
  );
}

{
  /* --- COMPONENTE: MODAL DUOBANK --- */
}

function ExpenseDetailModal({ expense, banks, onClose }) {
  const installmentsPaid = expense.payments?.length || 0;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg p-8">
        <h2 className="text-2xl font-black uppercase mb-2">
          {expense.description}
        </h2>
        <p className="text-slate-400 font-bold mb-6">
          Total: {formatCurrency(expense.amount)}
        </p>

        <div className="space-y-4">
          <h4 className="font-black text-xs uppercase text-slate-500">
            Status das Parcelas
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: expense.totalInstallments || 1 }).map(
              (_, i) => {
                const isPaid = expense.payments?.some(
                  (p) => p.installment === i + 1
                );
                return (
                  <button
                    disabled={isPaid}
                    onClick={() => handlePayment(expense, i + 1, "corrente")}
                    className={`p-3 rounded-2xl font-black text-xs flex flex-col items-center ${
                      isPaid
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <span>{i + 1}ª</span>
                    {isPaid ? <Check size={14} /> : <Lock size={14} />}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
function DuoBankModal({ bank, onClose, userProfile, duoList }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;

    const data = {
      title: f.title.value,
      bankName: f.bankName.value,
      accountInfo: f.accountInfo.value,
      responsible: f.responsible.value,
      currentAmount: Number(f.currentAmount.value),
      monthlyTarget: Number(f.monthlyTarget.value),
      goalAmount: Number(f.goalAmount.value),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (bank?.id) {
        await updateDoc(doc(db, "duo_banks", bank.id), data);
      } else {
        await addDoc(collection(db, "duo_banks"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#0D4233] p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl">
            {bank ? "Editar Conta" : "Nova Conta DuoBank"}
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Título da Reserva
            </label>
            <input
              name="title"
              required
              placeholder="Ex: Reserva de Emergência"
              defaultValue={bank?.title}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Banco
              </label>
              <input
                name="bankName"
                required
                placeholder="Ex: Nubank"
                defaultValue={bank?.bankName}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Conta/Agência
              </label>
              <input
                name="accountInfo"
                required
                placeholder="Ex: 0001 / 1234-5"
                defaultValue={bank?.accountInfo}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-[#B88A7D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Responsável no Duo
            </label>
            <select
              name="responsible"
              defaultValue={bank?.responsible || userProfile?.name}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none"
            >
              {duoList && duoList.length > 0 ? (
                duoList.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))
              ) : (
                <option value={userProfile?.name}>{userProfile?.name}</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Valor Guardado
              </label>
              <input
                name="currentAmount"
                type="number"
                step="0.01"
                required
                defaultValue={bank?.currentAmount || 0}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                Meta Final
              </label>
              <input
                name="goalAmount"
                type="number"
                step="0.01"
                required
                defaultValue={bank?.goalAmount || 0}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Depósito Mensal (Duo)
            </label>
            <input
              name="monthlyTarget"
              type="number"
              step="0.01"
              required
              defaultValue={bank?.monthlyTarget || 0}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D4233] text-white py-5 rounded-[2rem] font-black uppercase shadow-lg hover:bg-[#082F25] transition-all disabled:opacity-50"
          >
            {loading
              ? "Salvando..."
              : bank
              ? "Atualizar Conta"
              : "Adicionar ao DuoBank"}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuickDepositModal({ bank, onClose, userProfile }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("IN"); // 'IN' ou 'OUT'
  const [reason, setReason] = useState("");

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    const inputVal = Number(e.target.amount.value);
    const finalAmount = type === "IN" ? inputVal : -Math.abs(inputVal);

    if (type === "OUT" && Math.abs(finalAmount) > bank.currentAmount) {
      alert("Saldo insuficiente!");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "bank_history"), {
        bankId: bank.id,
        amount: finalAmount,
        user: userProfile.name,
        reason: type === "OUT" ? reason : "Depósito", // Salva o motivo
        date: new Date().toISOString(),
      });

      await updateDoc(doc(db, "duo_banks", bank.id), {
        currentAmount: Number(bank.currentAmount || 0) + finalAmount,
      });

      onClose();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in">
        <div
          className={`p-6 text-white text-center transition-colors ${
            type === "IN" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
            Movimentar
          </p>
          <h3 className="font-black text-xl">{bank.title}</h3>
        </div>

        <div className="flex p-2 bg-slate-100 m-4 rounded-2xl">
          <button
            onClick={() => setType("IN")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              type === "IN"
                ? "bg-white shadow-sm text-emerald-600"
                : "text-slate-400"
            }`}
          >
            Depósito
          </button>
          <button
            onClick={() => setType("OUT")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              type === "OUT"
                ? "bg-white shadow-sm text-rose-600"
                : "text-slate-400"
            }`}
          >
            Retirada
          </button>
        </div>

        <form onSubmit={handleAction} className="p-6 pt-0 space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
              R$
            </span>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="0,00"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-black text-2xl outline-none focus:border-slate-300"
            />
          </div>

          {type === "OUT" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                Motivo da Retirada
              </label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={type === "OUT"}
                placeholder="Ex: Pagar fatura, Emergência..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-xs outline-none focus:border-rose-300"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all ${
              type === "IN" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {loading
              ? "Processando..."
              : `Confirmar ${type === "IN" ? "Depósito" : "Retirada"}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest py-2"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose }) {
  const [loading, setLoading] = useState(false);
  // Se estiver editando, usa o ícone atual, senão o padrão
  const [selectedIcon, setSelectedIcon] = useState(room?.icon || "🏠");

  const icons = [
    "🍳",
    "🛏️",
    "🚿",
    "📺",
    "🧺",
    "📦",
    "🛋️",
    "🪴",
    "🚗",
    "🧸",
    "🍽️",
    "🧹",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // O ID do documento no Firebase será o label (limpo) ou o ID existente
    const data = {
      label: e.target.label.value,
      icon: selectedIcon,
      // Se não tiver cor definida, aplica uma padrão baseada em esmeralda
      color: room?.color || "bg-emerald-100 text-emerald-600",
    };

    try {
      if (room?.id) {
        await updateDoc(doc(db, "rooms", room.id), data);
      } else {
        // Criar novo cômodo
        await addDoc(collection(db, "rooms"), data);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao salvar cômodo:", err);
      alert("Erro ao salvar: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">
            {room ? "Editar Cômodo" : "Novo Cômodo"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Nome do Cômodo
            </label>
            <input
              name="label"
              defaultValue={room?.label}
              placeholder="Ex: Varanda Gourmet"
              required
              className="w-full mt-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Escolha um Ícone
            </label>
            <div className="grid grid-cols-5 gap-3 mt-2">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIcon(i)}
                  className={`text-2xl p-3 rounded-2xl transition-all ${
                    selectedIcon === i
                      ? "bg-emerald-500 text-white shadow-lg scale-110"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Confirmar Cômodo"}
          </button>
        </form>
      </div>
    </div>
  );
}
function HomeItemModal({ item, onClose, room }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;

    const data = {
      name: f.name.value,
      price: Number(f.price.value),
      link: f.link.value, // Agora será obrigatório pelo atributo 'required' no input
      room: room,
      bought: false, // Novo campo para controlar se já foi comprado sem sumir da lista
      createdAt: new Date().toISOString(),
    };

    try {
      if (item?.id) await updateDoc(doc(db, "home_items", item.id), data);
      else await addDoc(collection(db, "home_items"), data);
      onClose();
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h3 className="font-black text-xl">Novo Item</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <input
            name="name"
            required
            placeholder="Nome do Produto"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="Valor R$ 0,00"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"
          />

          {/* LINK AGORA É REQUIRED */}
          <input
            name="link"
            type="url"
            required
            placeholder="Link da Loja (Obrigatório)"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-lg hover:bg-emerald-700 transition-all"
          >
            {loading ? "Salvando..." : "Salvar no Inventário"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================================================
// TELA DE LOGIN
// =========================================================================================
function LoginScreen({ onLogin, usersList }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const found = usersList.find((u) => u.username === user.toLowerCase());
    if (found) {
      const hashed = await hashPassword(pass);
      if (found.password === hashed || found.password === pass) {
        localStorage.setItem("duogesto_uid", found.id);
        onLogin(found);
      } else {
        alert("Senha incorreta!");
      }
    } else {
      alert("Usuário não encontrado!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border-t-8 border-emerald-500 text-center animate-in zoom-in duration-500">
        <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner text-emerald-500">
          <Heart fill="currentColor" size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
          DuoGesto
        </h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            required
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 outline-none font-medium text-slate-700"
            placeholder="Usuário"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Senha"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 outline-none font-medium text-slate-700"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Entrar no App
          </button>
        </form>
      </div>
    </div>
  );
}
