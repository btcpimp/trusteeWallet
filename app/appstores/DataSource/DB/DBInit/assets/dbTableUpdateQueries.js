import axios from 'axios'

import countries from '../../../../../assets/jsons/other/country-codes'
import Log from '../../../../../services/Log/Log'
import BlocksoftDict from '../../../../../../crypto/common/BlocksoftDict'
import currencyActions from '../../../../Actions/CurrencyActions'

export default {
    maxVersion: 18,
    updateQuery: {
        1: {
            queryString: `ALTER TABLE account ADD COLUMN transactions_scan_time INTEGER NULL`,
            checkQueryString: false,
            checkQueryField : false
        },
        3: {
            queryString: `ALTER TABLE currency ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0`, //if = 1 - removed
        },
        4: {
            queryString: `ALTER TABLE card ADD COLUMN country_code VARCHAR(32) NULL`, //if = 'ua' - ukraine
            afterFunction: async (dbInterface) => {
                try {
                    const { array: cards } = await dbInterface.setQueryString('SELECT * FROM card').query()

                    for(let i = 0; i < cards.length; i++){
                        const link = `https://lookup.binlist.net/${cards[i].number}`
                        Log.log('DB/Update Migration 4 axios ' + link)
                        const res = await axios.get(link)

                        await dbInterface
                            .setTableName('card')
                            .setUpdateData({
                                key: {
                                    id: cards[i].id
                                },
                                updateObj: {
                                    country_code: res.data.country.numeric
                                }
                            })
                            .update()
                    }
                } catch (e) {
                    Log.err('DB/Update afterFunction - Migration 4 error', e)
                }

            }
        },
        5: {
            afterFunction: async (dbInterface) => {
                await dbInterface.setQueryString(`INSERT INTO settings ([paramKey], [paramValue]) VALUES ('local_currency', 'USD')`).query()
            }
        },
        6: {
            queryString: `ALTER TABLE card ADD COLUMN currency VARCHAR(32) NULL`,
            afterFunction: async (dbInterface) => {
                const { array: cards } = await dbInterface.setQueryString(`SELECT * FROM card`).query()

                for(let i = 0; i < cards.length; i++){

                    const tmpCountry = countries.find(item => item.iso === cards[i].country_code)

                    await dbInterface
                        .setTableName('card')
                        .setUpdateData({
                            key: {
                                id: cards[i].id
                            },
                            updateObj: {
                                currency: tmpCountry.currencyCode
                            }
                        })
                        .update()
                }
            }
        },
        7: {
            afterFunction: async (dbInterface) => {
                try {
                    const { array: cards } = await dbInterface.setQueryString('SELECT * FROM card').query()

                    for(let i = 0; i < cards.length; i++){

                        const link =`https://lookup.binlist.net/${cards[i].number}`
                        Log.log('DB/Update Migration 7 axios ' + link)
                        const res = await axios.get(link)

                        await dbInterface
                            .setTableName('card')
                            .setUpdateData({
                                key: {
                                    id: cards[i].id
                                },
                                updateObj: {
                                    country_code: res.data.country.numeric
                                }
                            })
                            .update()
                    }
                } catch (e) {
                    Log.err('DB/Update afterFunction - Migration 7 error', e)
                }

            }
        },
        8: {
            afterFunction: async (dbInterface) => {
                const { array: cards } = await dbInterface.setQueryString(`SELECT * FROM card`).query()

                for(let i = 0; i < cards.length; i++){

                    const tmpCountry = countries.find(item => item.iso === cards[i].country_code)

                    await dbInterface
                        .setTableName('card')
                        .setUpdateData({
                            key: {
                                id: cards[i].id
                            },
                            updateObj: {
                                currency: tmpCountry.currencyCode
                            }
                        })
                        .update()
                }
            }
        },
        9: {
            queryString: `ALTER TABLE account_balance ADD COLUMN balance_fix DECIMAL(50,20) NULL`,
        },
        10: {
            queryString: `ALTER TABLE account_balance ADD COLUMN balance_txt VARCHAR(256) NULL`,
        },
        11: {
            afterFunction: async (dbInterface) => {

                await dbInterface.setQueryString(`ALTER TABLE account_balance RENAME TO tmp`).query()

                await dbInterface.setQueryString(`CREATE TABLE IF NOT EXISTS account_balance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
                    balance_fix DECIMAL(50,20) NULL,
                    balance_txt VARCHAR(256) NULL,
                    balance_scan_time INTEGER NOT NULL,
                    status INTEGER NOT NULL,
                    currency_code VARCHAR(32) NOT NULL,
                    wallet_hash VARCHAR(256) NOT NULL,
                    account_id INTEGER NOT NULL,
                    
                    FOREIGN KEY(wallet_hash) REFERENCES wallet(wallet_hash),
                    FOREIGN KEY(account_id) REFERENCES account(id)
                )`).query()

                await dbInterface.setQueryString(`
                    INSERT INTO account_balance(balance_fix, balance_txt, balance_scan_time, status, currency_code, wallet_hash, account_id)
                    SELECT balance_fix, balance_txt, balance_scan_time, status, currency_code, wallet_hash, account_id
                    FROM tmp
                `).query()

                await dbInterface.setQueryString(`DROP TABLE tmp`).query()
            }
        },
        12: {
            afterFunction: async (dbInterface) => {
                try {

                    const { array: cryptocurrencies } = await dbInterface.setQueryString(`SELECT * FROM currency`).query()
                    let addedCryptocurrencies = []

                    for(let item of cryptocurrencies){
                        addedCryptocurrencies.push(item.currency_code)
                    }

                    for(let currencyCode of BlocksoftDict.Codes) {
                        if(addedCryptocurrencies.indexOf(currencyCode) === -1){
                            await currencyActions.addCurrency({ currencyCode: currencyCode }, 1, 0)
                        }
                    }

                    Log.log('DB/Update afterFunction - Migration 9 finish')
                } catch (e) {
                    Log.err('DB/Update afterFunction - Migration 9 error', e)
                }
            }
        },
        13: {
            queryString: `ALTER TABLE account_balance ADD COLUMN balance_provider VARCHAR(256) NULL`,
        },
        14: {
            queryString: `ALTER TABLE wallet ADD COLUMN wallet_is_backed_up INTEGER NULL`,
            afterFunction: async () => {
                try {
                    Log.log('DB/Update afterFunction - Migration 14 started')

                    await currencyActions.addCurrency({ currencyCode: 'TRX' }, 1, 0)

                    Log.log('DB/Update afterFunction - Migration 14 finish')
                } catch (e) {
                    Log.err('DB/Update afterFunction - Migration 14 error', e)
                }
            }
        },

        15 : {
            queryString : `
            CREATE TABLE IF NOT EXISTS custom_currency (
                id INTEGER PRIMARY KEY AUTOINCREMENT,        
              
                is_hidden INTEGER NOT NULL DEFAULT 0,
                
                currency_code VARCHAR(32) NOT NULL,
                currency_symbol VARCHAR(32) NOT NULL,
                currency_name VARCHAR(256) NOT NULL,
                
                token_type VARCHAR(32) NOT NULL,
                token_address VARCHAR(256) NOT NULL,
                token_decimals INTEGER NOT NULL,   
                token_json TEXT NULL
            )
            `
        },

        16 : {
            queryString : `
            CREATE TABLE IF NOT EXISTS transactions_used_outputs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                currency_code VARCHAR(256) NULL,                
                output_tx_id VARCHAR(256) NULL,
                output_vout VARCHAR(256) NULL,
                output_address VARCHAR(256) NULL,
                use_tx_id VARCHAR(256) NULL,                
                created_at DATETIME NULL
            )
            `
        },

        17: {
            queryString: `ALTER TABLE wallet ADD COLUMN wallet_is_subscribed INTEGER NULL`,
        },

        18: {
            queryString: `ALTER TABLE wallet ADD COLUMN wallet_is_subscribed_json TEXT NULL`,
        },
}
}
