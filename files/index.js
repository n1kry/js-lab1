const fs = require('fs');

/**
 * @class TransactionAnalyzer
 * @classdesc Класс для анализа транзакций
 */
class TransactionAnalyzer {
    /**
     * Создает экземпляр TransactionAnalyzer.
     * @param {Array} transactions - Массив транзакций
     */
    constructor(transactions) {
        this.transactions = transactions;
    }

    /**
     * Добавляет новую транзакцию.
     * @param {Object} transaction - Новая транзакция
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    /**
     * Возвращает все транзакции.
     * @returns {Array} Массив всех транзакций
     */
    getAllTransaction() {
        return this.transactions;
    }

    /**
     * Возвращает массив всевозможных типов транзакций.
     * @returns {Array} Массив уникальных типов транзакций
     */
    getUniqueTransactionType() {
        const types = new Set(this.transactions.map(t => t.transaction_type));
        return Array.from(types);
    }

    /**
     * Рассчитывает общую сумму всех транзакций.
     * @returns {number} Общая сумма всех транзакций
     */
    calculateTotalAmount() {
        return this.transactions.reduce((total, t) => total + parseFloat(t.transaction_amount), 0);
    }

    /**
     * Рассчитывает общую сумму транзакций за указанный год, месяц и день.
     * @param {number} year - Год
     * @param {number} month - Месяц
     * @param {number} day - День
     * @returns {number} Общая сумма транзакций
     */
    calculateTotalAmountByDate(year, month, day) {
        return this.transactions
            .filter(t => {
                const date = new Date(t.transaction_date);
                return (!year || date.getFullYear() === year) &&
                    (!month || date.getMonth() + 1 === month) &&
                    (!day || date.getDate() === day);
            })
            .reduce((total, t) => total + parseFloat(t.transaction_amount), 0);
    }

    /**
     * Возвращает транзакции указанного типа.
     * @param {string} type - Тип транзакции (debit или credit)
     * @returns {Array} Массив транзакций указанного типа
     */
    getTransactionByType(type) {
        return this.transactions.filter(t => t.transaction_type === type);
    }

    /**
     * Возвращает транзакции, проведенные в указанном диапазоне дат.
     * @param {string} startDate - Начальная дата
     * @param {string} endDate - Конечная дата
     * @returns {Array} Массив транзакций в указанном диапазоне дат
     */
    getTransactionsInDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.transactions.filter(t => {
            const date = new Date(t.transaction_date);
            return date >= start && date <= end;
        });
    }

    /**
     * Возвращает транзакции, совершенные с указанным торговым местом или компанией.
     * @param {string} merchantName - Имя торгового места или компании
     * @returns {Array} Массив транзакций с указанным торговым местом или компанией
     */
    getTransactionsByMerchant(merchantName) {
        return this.transactions.filter(t => t.merchant_name === merchantName);
    }

    /**
     * Возвращает среднее значение транзакций.
     * @returns {number} Среднее значение транзакций
     */
    calculateAverageTransactionAmount() {
        const total = this.calculateTotalAmount();
        return total / this.transactions.length;
    }

    /**
     * Возвращает транзакции с суммой в заданном диапазоне.
     * @param {number} minAmount - Минимальная сумма
     * @param {number} maxAmount - Максимальная сумма
     * @returns {Array} Массив транзакций в заданном диапазоне
     */
    getTransactionsByAmountRange(minAmount, maxAmount) {
        return this.transactions.filter(t => t.transaction_amount >= minAmount && t.transaction_amount <= maxAmount);
    }

    /**
     * Рассчитывает общую сумму дебетовых транзакций.
     * @returns {number} Общая сумма дебетовых транзакций
     */
    calculateTotalDebitAmount() {
        return this.getTransactionByType('debit')
            .reduce((total, t) => total + parseFloat(t.transaction_amount), 0);
    }

    /**
     * Возвращает месяц, в котором было больше всего транзакций.
     * @returns {string} Месяц с наибольшим количеством транзакций
     */
    findMostTransactionsMonth() {
        const count = this.transactions.reduce((acc, t) => {
            const month = new Date(t.transaction_date).toLocaleString('default', {month: 'long', year: 'numeric'});
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);
    }

    /**
     * Возвращает месяц, в котором было больше дебетовых транзакций.
     * @returns {string} Месяц с наибольшим количеством дебетовых транзакций
     */
    findMostDebitTransactionMonth() {
        const count = this.getTransactionByType('debit').reduce((acc, t) => {
            const month = new Date(t.transaction_date).toLocaleString('default', {month: 'long', year: 'numeric'});
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);
    }

    /**
     * Возвращает, каких транзакций больше всего.
     * @returns {string} 'debit' или 'credit' в зависимости от наибольшего количества транзакций, 'equal' если количество равно
     */
    mostTransactionTypes() {
        const count = this.transactions.reduce((acc, t) => {
            acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
            return acc;
        }, {});
        if (count.debit > count.credit) return 'debit';
        if (count.credit > count.debit) return 'credit';
        return 'equal';
    }

    /**
     * Возвращает транзакции, совершенные до указанной даты.
     * @param {string} date - Дата
     * @returns {Array} Массив транзакций, совершенных до указанной даты
     */
    getTransactionsBeforeDate(date) {
        const end = new Date(date);
        return this.transactions.filter(t => new Date(t.transaction_date) < end);
    }

    /**
     * Возвращает транзакцию по ее уникальному идентификатору.
     * * @param {string} id - Уникальный идентификатор транзакции
     * * @returns {Object|null} Объект транзакции или null, если транзакция не найдена
     * */
    findTransactionById(id) {
        return this.transactions.find(t => t.transaction_id === id) || null;
    }

    /**
     * Возвращает новый массив, содержащий только описания транзакций.
     * @returns {Array} Массив описаний транзакций
     */
    mapTransactionDescriptions() {
        return this.transactions.map(t => t.transaction_description);
    }
}

// Пример использования класса TransactionAnalyzer
const transactions = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));
const analyzer = new TransactionAnalyzer(transactions);

// Получение уникальных типов транзакций и вывод в консоль
console.log('Уникальные типы транзакций:', analyzer.getUniqueTransactionType());

// Вычисление общей суммы всех транзакций и вывод в консоль
console.log('Общая сумма всех транзакций:', analyzer.calculateTotalAmount());

// Вычисление среднего значения транзакций и вывод в консоль
console.log('Среднее значение транзакций:', analyzer.calculateAverageTransactionAmount());

// Получение транзакций за указанный диапазон дат и вывод в консоль
console.log('Транзакции за указанный диапазон дат:', analyzer.getTransactionsInDateRange('2019-01-01', '2019-01-02'));

// Получение транзакций по магазину "SuperMart" и вывод в консоль
console.log('Транзакции по магазину "SuperMart":', analyzer.getTransactionsByMerchant('SuperMart'));

// Получение всех транзакций и вывод в консоль
console.log('Все транзакции:', analyzer.getAllTransaction());

// Получение транзакций заданного типа и вывод в консоль
console.log('Транзакции заданного типа:', analyzer.getTransactionByType('debit'));

// Получение транзакций до указанной даты и вывод в консоль
console.log('Транзакции до указанной даты:', analyzer.getTransactionsBeforeDate('2019-01-01'));

// Поиск транзакции по идентификатору и вывод в консоль
console.log('Транзакция по идентификатору:', analyzer.findTransactionById('12345'));

// Поиск месяца с наибольшим количеством транзакций и вывод в консоль
console.log('Месяц с наибольшим количеством транзакций:', analyzer.findMostTransactionsMonth());

// Поиск месяца с наибольшим количеством дебетовых транзакций и вывод в консоль
console.log('Месяц с наибольшим количеством дебетовых транзакций:', analyzer.findMostDebitTransactionMonth());

// Получение типа транзакций с наибольшим количеством и вывод в консоль
console.log('Тип транзакций с наибольшим количеством:', analyzer.mostTransactionTypes());

// Получение списка описаний транзакций и вывод в консоль
console.log('Описания всех транзакций:', analyzer.mapTransactionDescriptions());

// Вычисление общей суммы дебетовых транзакций и вывод в консоль
console.log('Общая сумма дебетовых транзакций:', analyzer.calculateTotalDebitAmount());

// Получение транзакций с суммой в указанном диапазоне и вывод в консоль
console.log('Транзакции с суммой в указанном диапазоне:', analyzer.getTransactionsByAmountRange(50, 200));

// Вычисление общей суммы транзакций за указанный год, месяц и день и вывод в консоль
console.log('Общая сумма транзакций за указанную дату:', analyzer.calculateTotalAmountByDate(2019, 1, 1));

// Добавление новой транзакции и вывод в консоль
const newTransaction = {
    transaction_id: "6",
    transaction_date: "2022-05-25",
    transaction_amount: "150.00",
    transaction_type: "debit",
    transaction_description: "Payment for dinner",
    merchant_name: "Restaurant",
    card_type: "MasterCard",
};
analyzer.addTransaction(newTransaction);
console.log('Новая транзакция добавлена:', newTransaction,"\n Новые: ", analyzer.getAllTransaction());