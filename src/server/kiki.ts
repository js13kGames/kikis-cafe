import { LoginDB } from "okay-site-login/server/login-db"
import { UserServer } from "okay-site-login/server/utils"
import { resolve } from "path"
import pg from "pg"
import { DBPG } from "rokay/server/db/db-pg"
import { Eq } from "rokay/server/db/filter"
import { migrate } from "rokay/server/db/migrate"
import { getDirname } from "rokay/server/node"

import { APIs } from "./apis.gen.js"
import { AppServer } from "./app.js"
import { Base } from "./base.gen.js"
import { KikiConfig } from "./config.js"
import { KikiDB } from "./db.js"
import { HTML } from "./html.js"

const { Pool } = pg

const __dirname = getDirname(import.meta)


export const
  Kiki = (config: KikiConfig) => {
    getAndMigrateKikiDB().then(({ kikiDB: _kikiDB, loginDB }) => {
      UserServer("Kiki", config.server, { loginDB }, ({ users }) => ({
        apis: [
          APIs(
            {
              HTML: (elt, req, res) =>
                users.current(req, res).then((user) => {
                  const app = AppServer(req, user)
                  return HTML(app, Base(app, elt))
                }),
            },
            {},
          ),
        ],
        notFound: (req, res) =>
          users.current(req, res).then((user) => {
            const app = AppServer(req, user)
            return HTML(app, Base(app))
          }),
      }))
    }, error => {
      console.error("Error Running Migrations:", error)
    })
  }


const
  getAndMigrateKikiDB = (): Promise<{ kikiDB: KikiDB, loginDB: LoginDB }> => {
    const
      project = "kiki",
      pool = new Pool(),
      db = DBPG(pool),
      Migrations = db.table<{
        created: Date
        file: string
        project: string
      }>("migrations")

    return migrate(
      resolve(__dirname, "..", "..", "schema"),
      db.transact,
      conn =>
        conn.q(Migrations.select(["file"], {
          where: Eq("project", project)
        }))
          .then(rows => rows.map(r => r.file)),
      (conn, file) =>
        conn.e(Migrations.insert([{ file, project }])),
    )
      .then(() => ({
        kikiDB: KikiDB(db),
        loginDB: LoginDB(db),
      }))
  }
