const STORAGE_PARAMERTERS_KEY = "parameters_key";

type QueuedEvent = {
  data: Record<string, string>;
  isReady: boolean;
  tries: number;
};

const createId = () => {
  return Math.random().toString(36).substring(2, 15);
};

let QUEUE: QueuedEvent[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let timeoutId: any = null;

const sendEvent = async (event: Record<string, string>) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000);

  // normally we would use fetch here to send the event to the server
  console.log("Sending event", event);
  clearTimeout(timeoutId);
};

const processEvent = (event: QueuedEvent) => {
  if (event.isReady) {
    sendEvent(event.data);
  } else {
    addPendingEvent(event.data, {})(event.data, event.tries);
  }
};

const iterateQueue = async () => {
  const copiedQueue = [...QUEUE];
  QUEUE = [];
  while (copiedQueue.length > 0) {
    const event = copiedQueue.shift();

    if (!event) {
      continue;
    }

    processEvent(event);
  }
};

const transform = (
  body: Record<string, string>,
  data: Record<string, string>,
  tries: number
) => {
  // normally we would validate the event here and set isReady to true if it's valid

  const event = {
    data: { ...body, ...data },
    isReady: true,
    tries: tries + 1,
  };

  return event;
};

function addPendingEvent(
  preBody: Record<string, string>,
  data: Record<string, string>
) {
  return (body: Record<string, string>, tries = 0) => {
    const event = transform({ ...preBody, ...body }, data, tries);

    if (event) {
      QUEUE.push(event);
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      iterateQueue();
    }, 1000);

    const pendingEvents = JSON.parse(
      sessionStorage.getItem("pendingEvents") ?? "[]"
    );

    pendingEvents.push({
      event,
      data,
    });

    sessionStorage.setItem("pendingEvents", JSON.stringify(pendingEvents));
  };
}

const createAddPendingEvent = (event: Record<string, string>) => () => {
  const productId = createId();
  const timestamp = new Date().toISOString();
  const paymentMethod = ["credit", "paypal", "debit"][
    Math.floor(Math.random() * 3)
  ];
  const price = String(Math.floor(Math.random() * 1000));

  const passEvent = addPendingEvent(event, {
    productId,
    timestamp,
    paymentMethod,
    price,
  });

  return passEvent;
};

const getParemeter = () => {
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

const getUserId = () => {
  const id = sessionStorage.getItem("visitorId");
  if (id) {
    return id;
  }
  const userId = createId();
  sessionStorage.setItem("userId", userId);
  return userId;
};

const initTracking = () => {
  const PARAMETERS = getParemeter();
  const USER_ID = getUserId();

  sessionStorage.setItem(STORAGE_PARAMERTERS_KEY, JSON.stringify(PARAMETERS));

  const body = {
    ...PARAMETERS,
    userId: USER_ID,
  };

  return { createAddPendingEvent: createAddPendingEvent(body) };
};

export const tracking = initTracking();
