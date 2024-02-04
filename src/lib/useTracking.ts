import { atom, useAtomValue } from "jotai";

type TrackingData = Record<string, any>;

const STORAGE_PARAMERTERS_KEY = "parameters_key";

const getParameter = () => {
  const searchParameters = new URLSearchParams(window.location.search);
  const parameter = Object.fromEntries(searchParameters) as Record<
    string,
    string
  >;
  const storedParameters = JSON.parse(
    sessionStorage.getItem(STORAGE_PARAMERTERS_KEY) ?? "{}"
  );

  return {
    ...parameter,
    ...storedParameters,
  };
};

const createId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const parametersAtom = atom(() => getParameter());
const userIdAtom = atom(() => createId());

function nextTick(callback: () => void) {
  setTimeout(callback, 0);
}

export function useInitialzeTracking() {
  const params = useAtomValue(parametersAtom);
  const userId = useAtomValue(userIdAtom);

  const body = { ...params, userId };

  return { body };
}

export const useTracking = () => {
  const params = useAtomValue(parametersAtom);
  const userId = useAtomValue(userIdAtom);

  const body = { ...params, userId };

  function track(data: TrackingData) {
    nextTick(() => sendData(prepareData(data, body))); // sends it at the next tick
  }

  return { track };
};

function prepareData(data: TrackingData, body: TrackingData) {
  // simple mock of the prepareData function
  return {
    ...data,
    ...body,
  };
}

function sendData(data: TrackingData) {
  // normally a fetch request would be made here
  console.log("Sending data", data);
}
