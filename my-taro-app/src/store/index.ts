import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers'

const composeEnhancers = 
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) 
    : compose

const middlewares = [thunkMiddleware]

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares)
)

export default function configStore() {
  const store = createStore(rootReducer, enhancer)
  return store
} 