import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  MenuItem, 
  TextField, 
  Button,
  Grid,
  FormControl,
  InputLabel
} from '@mui/material';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ValueDisplay = ({ value, path }) => {
  const [flash, setFlash] = useState(false);
  const [change, setChange] = useState(null);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      const changeAmount = value - prevValue;
      setChange(changeAmount);
      setFlash(true);
      
      const timer = setTimeout(() => {
        setFlash(false);
        setChange(null);
        setPrevValue(value);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Typography
        sx={{
          transition: 'all 0.5s ease',
          color: flash 
            ? (change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'inherit')
            : 'inherit',
          fontWeight: flash ? 'medium' : 'regular',
        }}
      >
        {formatCurrency(value)}
        {change !== null && (
          <span style={{ 
            marginLeft: '8px',
            fontSize: '0.875rem',
            color: change > 0 ? '#2e7d32' : '#d32f2f'
          }}>
            ({change > 0 ? '+' : ''}{formatCurrency(change)})
          </span>
        )}
      </Typography>
    </Box>
  );
};

const FinancialStatementsVisualizer = () => {
  const initialFinancials = {
    balanceSheet: {
      assets: {
        cash: 1000000,
        equipment: 500000,
        inventory: 300000,
      },
      liabilities: {
        shortTermDebt: 200000,
        longTermDebt: 400000,
      },
      equity: {
        commonStock: 1000000,
        retainedEarnings: 200000,
      }
    },
    incomeStatement: {
      revenue: 0,
      expenses: 0,
      netIncome: 0
    },
    cashFlow: {
      operating: 0,
      investing: 0,
      financing: 0
    }
  };

  const [financials, setFinancials] = useState(initialFinancials);
  const [selectedAction, setSelectedAction] = useState('');
  const [amount, setAmount] = useState('');

  const actions = [
    { id: 'sellAsset', label: 'Sell Equipment' },
    { id: 'takeLoan', label: 'Take on Loan' },
    { id: 'payDividend', label: 'Pay Dividend' },
    { id: 'buyInventory', label: 'Purchase Inventory' },
    { id: 'makeRevenue', label: 'Record Revenue (Cash)' }
  ];

  const updateFinancials = () => {
    const newFinancials = {...financials};
    const amountNum = parseFloat(amount);

    switch(selectedAction) {
      case 'sellAsset':
        newFinancials.balanceSheet.assets.cash += amountNum;
        newFinancials.balanceSheet.assets.equipment -= amountNum;
        newFinancials.cashFlow.investing += amountNum;
        break;
      
      case 'takeLoan':
        newFinancials.balanceSheet.assets.cash += amountNum;
        newFinancials.balanceSheet.liabilities.longTermDebt += amountNum;
        newFinancials.cashFlow.financing += amountNum;
        break;
      
      case 'payDividend':
        newFinancials.balanceSheet.assets.cash -= amountNum;
        newFinancials.balanceSheet.equity.retainedEarnings -= amountNum;
        newFinancials.cashFlow.financing -= amountNum;
        break;
      
      case 'buyInventory':
        newFinancials.balanceSheet.assets.cash -= amountNum;
        newFinancials.balanceSheet.assets.inventory += amountNum;
        newFinancials.cashFlow.operating -= amountNum;
        break;
      
      case 'makeRevenue':
        newFinancials.balanceSheet.assets.cash += amountNum;
        newFinancials.balanceSheet.equity.retainedEarnings += amountNum;
        newFinancials.incomeStatement.revenue += amountNum;
        newFinancials.incomeStatement.netIncome += amountNum;
        newFinancials.cashFlow.operating += amountNum;
        break;
    }

    setFinancials(newFinancials);
    setAmount('');
    setSelectedAction('');
  };

  const StatementSection = ({ title, items }) => (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      <Box sx={{ pl: 2 }}>
        {items.map(([label, value, path]) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Typography>{label}:</Typography>
            <ValueDisplay value={value} path={path} />
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Financial Statements Visualizer
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select action</InputLabel>
          <Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            label="Select action"
          >
            <MenuItem value="">
              <em>Select an action</em>
            </MenuItem>
            {actions.map(action => (
              <MenuItem key={action.id} value={action.id}>
                {action.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          type="number"
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ width: 150 }}
        />
        
        <Button
          variant="contained"
          onClick={updateFinancials}
          disabled={!selectedAction || !amount}
          sx={{ width: 120 }}
        >
          Execute
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Balance Sheet</Typography>
              
              <StatementSection
                title="Assets"
                items={[
                  ['Cash', financials.balanceSheet.assets.cash, 'balanceSheet.assets.cash'],
                  ['Equipment', financials.balanceSheet.assets.equipment, 'balanceSheet.assets.equipment'],
                  ['Inventory', financials.balanceSheet.assets.inventory, 'balanceSheet.assets.inventory'],
                ]}
              />
              
              <StatementSection
                title="Liabilities"
                items={[
                  ['Short-term Debt', financials.balanceSheet.liabilities.shortTermDebt, 'balanceSheet.liabilities.shortTermDebt'],
                  ['Long-term Debt', financials.balanceSheet.liabilities.longTermDebt, 'balanceSheet.liabilities.longTermDebt'],
                ]}
              />
              
              <StatementSection
                title="Equity"
                items={[
                  ['Common Stock', financials.balanceSheet.equity.commonStock, 'balanceSheet.equity.commonStock'],
                  ['Retained Earnings', financials.balanceSheet.equity.retainedEarnings, 'balanceSheet.equity.retainedEarnings'],
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Income Statement</Typography>
              
              <StatementSection
                items={[
                  ['Revenue', financials.incomeStatement.revenue, 'incomeStatement.revenue'],
                  ['Expenses', financials.incomeStatement.expenses, 'incomeStatement.expenses'],
                  ['Net Income', financials.incomeStatement.netIncome, 'incomeStatement.netIncome'],
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Cash Flow Statement</Typography>
              
              <StatementSection
                items={[
                  ['Operating', financials.cashFlow.operating, 'cashFlow.operating'],
                  ['Investing', financials.cashFlow.investing, 'cashFlow.investing'],
                  ['Financing', financials.cashFlow.financing, 'cashFlow.financing'],
                  ['Net Cash Flow', 
                    financials.cashFlow.operating + 
                    financials.cashFlow.investing + 
                    financials.cashFlow.financing, 
                    'cashFlow.total'
                  ],
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialStatementsVisualizer;