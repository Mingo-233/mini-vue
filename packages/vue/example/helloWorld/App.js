import { h } from '../../dist/mini-vue.esm-bundler.js'
export default {
    name: 'App',
    render() {
        return h('div', { class: 'red' }, 'msg:' + this.word)
    },
    setup() {
        return {
            word: 'hello'
        }
    }
}