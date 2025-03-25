/**
 * se creo un typo customizable para poder utilizar en vez de usar any
 * es mas bonito que usar solamente any, claramente esto es puede prestarse para inyectar bugs como el any
 * pero es mas practico
 */
export declare type CustomeType<T = string | boolean | number | any[] | any> = T;