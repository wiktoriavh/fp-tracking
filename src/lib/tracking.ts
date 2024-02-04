import { debounce } from './debounce';

const STORAGE_PARAMETERS_KEY = 'parameters_key';

type QueuedEvent = {
  data: Record<string, string>;
  isReady: boolean;
  tries: number;
};

const createId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const QUEUE: QueuedEvent[] = [];

const sendEvent = async (event: Record<string, string>) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000);

  // normally we would use fetch here to send the event to the server
  console.log('Sending event', event);
  clearTimeout(timeoutId);
};

const processEvent = (event: QueuedEvent) => {
  if (event.isReady) {
    sendEvent(event.data);
  } else {
    // if the event already went through addPendingEvent once, why send it again? why would it become ready later?
    addPendingEvent(event.data, { tries: event.tries });
  }
};

// Directly debounce function definition so this logic doesn't need to exist in the queuing function
const iterateQueue = debounce(async () => {
  while (QUEUE.length) {
    const event = QUEUE.shift()!;
    processEvent(event);
  }
});

// whats the difference between body and data?
const transform = (data: Record<string, string>, tries: number) => {
  // normally we would validate the event here and set isReady to true if it's valid
  // if it's not valid, why do we keep it not ready? will it be fixed later?

  const event = {
    data,
    isReady: true,
    tries: tries + 1
  };

  return event;
};

// use bind for partial application for multiple use cases
const addPendingEvent = ((...data: Record<string, string | number>[]) => {
  const { tries, ...eventData } = Object.assign({}, ...data);
  const event = transform(eventData, tries);

  if (!event) return;

  QUEUE.push(event);
  iterateQueue();

  const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') ?? '[]');

  pendingEvents.push({
    event,
    data
  });

  sessionStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
}).bind(this);

const bindEvents = (event: Record<string, string>) => () => {
  const productId = createId();
  const timestamp = new Date().toISOString();
  const paymentMethod = ['credit', 'paypal', 'debit'][Math.floor(Math.random() * 3)];
  const price = String(Math.floor(Math.random() * 1000));

  const passEvent = addPendingEvent.bind(event, {
    productId,
    timestamp,
    paymentMethod,
    price
  });

  return passEvent;
};

const getParemeter = () => {
  const searchParameters = new URLSearchParams(window.location.search);
  const parameter = Object.fromEntries(searchParameters) as Record<string, string>;
  const storedParameters = JSON.parse(sessionStorage.getItem(STORAGE_PARAMETERS_KEY) ?? '{}');

  return {
    ...parameter,
    ...storedParameters
  };
};

const getUserId = () => {
  const id = sessionStorage.getItem('visitorId');
  if (id) {
    return id;
  }
  const userId = createId();
  sessionStorage.setItem('userId', userId);
  return userId;
};

const initTracking = () => {
  const PARAMETERS = getParemeter();
  const USER_ID = getUserId();

  sessionStorage.setItem(STORAGE_PARAMETERS_KEY, JSON.stringify(PARAMETERS));

  const body = {
    ...PARAMETERS,
    userId: USER_ID
  };

  return { createEvent: bindEvents(body) };
};

export const tracking = initTracking();
