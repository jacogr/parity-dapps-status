
import request from 'browser-request';

// Middleware classes
import logger from './logger';
import WebInteractions from './user-web3-interactions';
import Rpc from './rpc';
import LocalStorage from './localstorage';
import Toastr from './toastr.js';

export default function (ethapi) {
  const web3Interactions = new WebInteractions(ethapi);
  const rpc = new Rpc(request);
  const localstorage = new LocalStorage();
  const toastr = new Toastr();

  return [
    logger,
    web3Interactions.toMiddleware(),
    rpc.toMiddleware(),
    localstorage.toMiddleware(),
    toastr.toMiddleware()
  ];
}
