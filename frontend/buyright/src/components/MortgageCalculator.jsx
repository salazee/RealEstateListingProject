// src/components/MortgageCalculator.jsx
import { useState } from 'react';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function MortgageCalculator({ propertyPrice = 0 }) {
  const [inputs, setInputs] = useState({
    homePrice: propertyPrice || 0,
    downPayment: 0,
    loanTerm: 20, // years
    interestRate: 12.5 // percentage
  });

  const [result, setResult] = useState(null);

  const calculateMortgage = () => {
    const { homePrice, downPayment, loanTerm, interestRate } = inputs;

    // Validation
    if (homePrice <= 0) {
      alert('Please enter a valid home price');
      return;
    }

    const principal = homePrice - downPayment; // Loan amount
    const monthlyRate = interestRate / 100 / 12; // Monthly interest rate
    const numberOfPayments = loanTerm * 12; // Total months

    // Monthly payment calculation (P * r * (1+r)^n) / ((1+r)^n - 1)
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal,
      downPaymentPercent: (downPayment / homePrice) * 100
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalculatorIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold">Mortgage Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Home Price */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            Home Price
          </label>
          <input
            type="number"
            value={inputs.homePrice}
            onChange={(e) => setInputs({ ...inputs, homePrice: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="15000000"
          />
        </div>

        {/* Down Payment */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <ChartBarIcon className="w-4 h-4" />
            Down Payment
          </label>
          <input
            type="number"
            value={inputs.downPayment}
            onChange={(e) => setInputs({ ...inputs, downPayment: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="3000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {inputs.homePrice > 0 && inputs.downPayment > 0
              ? `${((inputs.downPayment / inputs.homePrice) * 100).toFixed(1)}% of home price`
              : 'Typically 20% of home price'}
          </p>
        </div>

        {/* Loan Term */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4" />
            Loan Term (Years)
          </label>
          <select
            value={inputs.loanTerm}
            onChange={(e) => setInputs({ ...inputs, loanTerm: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="5">5 years</option>
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25">25 years</option>
            <option value="30">30 years</option>
          </select>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputs.interestRate}
            onChange={(e) => setInputs({ ...inputs, interestRate: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="14.5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Average mortgage rate in Nigeria: 12-18%
          </p>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateMortgage}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
        >
          <CalculatorIcon className="w-5 h-5" />
          Calculate
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Your Monthly Payment</h4>
            
            <div className="bg-white p-4 rounded-lg mb-3">
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(result.monthlyPayment)}
              </p>
              <p className="text-sm text-gray-600">per month</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal & Interest</span>
                <span className="font-medium">{formatCurrency(result.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Total Loan Amount</span>
                <span className="font-medium">{formatCurrency(result.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest Paid</span>
                <span className="font-medium text-red-600">{formatCurrency(result.totalInterest)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total Amount Paid</span>
                <span>{formatCurrency(result.totalPayment)}</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This is an estimate. Actual payments may include taxes, insurance, and other fees.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}