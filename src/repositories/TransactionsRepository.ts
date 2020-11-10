import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (accumulator: Balance, currentTransaction: Transaction) => {
        if (currentTransaction.type === 'income') {
          accumulator.income += Number(currentTransaction.value);
        } else if (currentTransaction.type === 'outcome') {
          accumulator.outcome += Number(currentTransaction.value);
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
