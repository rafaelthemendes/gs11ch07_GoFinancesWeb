import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import incomeIcon from '../../assets/income.svg';
import outcomeIcon from '../../assets/outcome.svg';
import totalIcon from '../../assets/total.svg';
import Header from '../../components/Header';
import api from '../../services/api';
import formatValue from '../../utils/formatValue';
import { Card, CardContainer, Container, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface TransactionApi {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: string;
  created_at: string;
  category: {
    title: string;
  };
}

interface BalanceApi {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsResponse {
  transactions: TransactionApi[];
  balance: BalanceApi;
}

const parseTransaction = (transactionApi: TransactionApi): Transaction => {
  const value = Number(transactionApi.value);
  const created_at = new Date(transactionApi.created_at);
  return {
    id: transactionApi.id,
    title: transactionApi.title,
    type: transactionApi.type,
    value,
    formattedValue: formatValue(Number(transactionApi.value)),
    formattedDate: format(created_at, 'dd/MM/yyyy'),
    created_at,
    category: {
      title: transactionApi.category.title,
    },
  };
};

const parseBalance = ({ income, outcome, total }: BalanceApi): Balance => {
  return {
    income: formatValue(income),
    outcome: formatValue(outcome),
    total: formatValue(total),
  };
};

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      try {
        const { data } = await api.get<TransactionsResponse>('transactions');
        setTransactions(data.transactions.map(parseTransaction));
        setBalance(parseBalance(data.balance));
      } catch (error) {
        // console.log(error);
      }
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header page="dashboard" />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={incomeIcon} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance && balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcomeIcon} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance && balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={totalIcon} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance && balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.type === 'outcome' && '- '}
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
