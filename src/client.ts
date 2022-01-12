
const dataMap = new Map<string,any>();

const createSocket = () => {
    console.log('[lent] connecting...');
    const ws = new WebSocket('ws://localhost:3050')
    ws.addEventListener("open", () => {
        console.log('[lent] connected');
    })
    ws.addEventListener("message", (msg) => {
        try {
            const data = JSON.parse(msg.data);
            if (data.hot) {
                if(dataMap.has(data.fileName)){
                }else{
                    window.location.reload();
                }
            }
        } catch (error) {
            console.log(console.log('[lent] message error'));
        }
    })
}
const createHot = () => {
    return {
        accept(){

        }
    }
}

createSocket();

const hot = createHot();

Object.defineProperty(window, "hot", {
    get() {
        return hot;
    }
})