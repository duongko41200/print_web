/**
 * @desc catch error for each controller function
 * @note just for functions having 3 params (req, res, next)
 * 
 * @param {Function} fn - function to send response
 * @return {Function}
 */
module.exports = fn => {
    return (req, res ,next) => {
        fn (req, res, next).catch(err => next(err))
    }
}