export type Assets = { cat: HTMLImageElement }


export const
  load = () =>
    Promise.all([loadImage("/art/cat.png")]).then(([cat]): Assets => ({ cat }))


const
  loadImage = (src: string) =>
    new Promise<HTMLImageElement>(
      (res, rej) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          res(img)
        }
        img.onerror = (e) => {
          rej(e)
        }
      },
    )
