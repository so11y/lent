import Http from "http";

export const isJsFlieRequest = (s: Http.IncomingMessage) => {
    return s.url.endsWith(".js")
}
