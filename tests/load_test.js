import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 30 },  // Stay at 20 users
        { duration: '30s', target: 10 },  // Ramp down to 0
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 40 },  // Stay at 20 users
        { duration: '30s', target: 5 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<3000'], // 95% of requests should be below 3s
    },
};

export default function () {
    const url = 'http://localhost:3000/tickets?delay=2000';

    const res = http.get(url);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'status is 429': (r) => r.status === 429,
    });

    sleep(1);
}
