import { DB } from "rokay/server/db/db"


export type KikiDB = ReturnType<typeof KikiDB>


export const
  KikiDB = (db: DB) => ({
    single: db.single,

    transact: db.transact,
  })
