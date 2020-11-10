import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);

    const categoryTitleExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryTitleExists) {
      const createdCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(createdCategory);
    }

    const foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      throw new AppError('Failed to find or create category', 500);
    }

    const category_id = foundCategory.id;

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not enough cash.', 400);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
