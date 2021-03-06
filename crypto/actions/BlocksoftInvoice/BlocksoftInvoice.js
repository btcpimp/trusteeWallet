import BlocksoftCryptoLog from '../../common/BlocksoftCryptoLog'

const Dispatcher = require('../../blockchains/Dispatcher').init()

class BlocksoftInvoice {

    /**
     * @type {{}}
     * @private
     */
    _processor = {}
    /**
     * @type {{privateKey, addressFrom, addressTo, amount, feeForTx, currencyCode, addressForChange, replacingTransaction, nSequence}}
     * @private
     */
    _data = {}

    /**
     * @param address
     * @return {BlocksoftInvoice}
     */
    setAddress(address) {
        this._data.address = address
        return this
    }

    /**
     * @param jsonData
     * @return {BlocksoftInvoice}
     */
    setAdditional(jsonData) {
        this._data.jsonData = jsonData
        return this
    }

    /**
     * @param amount
     * @return {BlocksoftInvoice}
     */
    setAmount(amount) {
        this._data.amount = amount
        return this
    }

    /**
     * @param memo
     * @return {BlocksoftInvoice}
     */
    setMemo(memo) {
        this._data.memo = memo
        return this
    }

    /**
     * @param currencyCode
     * @return {BlocksoftInvoice}
     */
    setCurrencyCode(currencyCode) {
        this._data.currencyCode = currencyCode
        if (!this._processor[currencyCode]) {
            /**
             * @type {BtcLightInvoiceProcessor}
             */
            this._processor[currencyCode] = Dispatcher.getInvoiceProcessor(currencyCode)
        }
        return this
    }


    /**
     * @return {Promise<{hash}>}
     */
    async createInvoice() {
        let currencyCode = this._data.currencyCode
        if (!currencyCode) {
            throw new Error('plz set currencyCode before calling')
        }
        let res = ''
        try {
            BlocksoftCryptoLog.log(`BlocksoftInvoice.createInvoice ${currencyCode} started`, this._data)
            res = await this._processor[currencyCode].createInvoice(this._data)
            BlocksoftCryptoLog.log(`BlocksoftInvoice.createInvoice ${currencyCode} finished`, res)
        } catch (e) {
            // noinspection ES6MissingAwait
            BlocksoftCryptoLog.err(`BlocksoftInvoice.createInvoice ${currencyCode} error ` + e.message, e.data ? e.data : e)
            throw e
        }

        return res
    }

    async checkInvoice(hash) {
        let currencyCode = this._data.currencyCode
        if (!currencyCode) {
            throw new Error('plz set currencyCode before calling')
        }
        let res = ''
        try {
            BlocksoftCryptoLog.log(`BlocksoftInvoice.checkInvoice ${currencyCode} started`, this._data)
            res = await this._processor[currencyCode].checkInvoice(hash, this._data)
            BlocksoftCryptoLog.log(`BlocksoftInvoice.checkInvoice ${currencyCode} finished`, res)
        } catch (e) {
            if (e.message != 'not a valid invoice') {
                // noinspection ES6MissingAwait
                BlocksoftCryptoLog.err(`BlocksoftInvoice.checkInvoice ${currencyCode} error ` + e.message, e.data ? e.data : e)
            }
            throw e
        }

        return res
    }
}

let singleBlocksoftInvoice = new BlocksoftInvoice()

export default singleBlocksoftInvoice
