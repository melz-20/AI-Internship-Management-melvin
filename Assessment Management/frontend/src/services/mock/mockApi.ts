const delay=(ms=350)=>new Promise(resolve=>setTimeout(resolve,ms))
export async function mockRequest<T>(value:T):Promise<T>{await delay();return structuredClone(value)}
