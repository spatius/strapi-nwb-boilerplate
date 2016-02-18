import fetch from 'isomorphic-fetch';
import URI from "urijs";

function process(response) {
  console.log("process", response);

  const promise = response.json();

  if(!response.ok)
    return promise.then(error => {
      throw error;
    });

  return promise;
}

export function get(path, data) {
  return fetch(path + "?" + URI.buildQuery(data), {
    method: 'get',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: "Bearer " + localStorage.getItem("jwt") }
  }).then(process);
}

export function post(path, data) {
  return fetch(path, {
    method: 'post',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: "Bearer " + localStorage.getItem("jwt") },
    body: JSON.stringify(data)
  }).then(process);
}

export function put(path, data) {
  return fetch(path, {
    method: 'put',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: "Bearer " + localStorage.getItem("jwt") },
    body: JSON.stringify(data)
  }).then(process);
}

export function upload(data) {
  return fetch("/api/upload", {
    method: 'post',
    headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    body: data
  }).then(process);
}
