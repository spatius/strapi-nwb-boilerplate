import fetch from 'isomorphic-fetch';
import URI from "urijs";

function process(response) {
  const promise = response.json();

  if(!response.ok)
    return promise.then(error => {
      console.log(error);
      
      throw error;
    });

  return promise;
}

export function get(path, data) {
  return fetch(URI(window.location.origin + '/' + path).query(data), {
    method: 'get',
    headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + localStorage.getItem("jwt") }
  }).then(process);
}

export function post(path, data) {
  return fetch(window.location.origin + '/' + path, {
    method: 'post',
    headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + localStorage.getItem("jwt") },
    body: JSON.stringify(data)
  }).then(process);
}
