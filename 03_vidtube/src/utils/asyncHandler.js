//the goal is to genralize a function so that we dont need to write try catch
//multiple times


//this is what is happening here
/**promise.resolve will give us the final objcet success or failure
 * next will catch the error and then pass it to express gloabal object 
 *      preventing the app from getting crashed
 */

/* it takes the function as parameter and returns anothert function as parameter
if next() is called likem this control goes to next middleware
**/

const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}

export {asyncHandler};