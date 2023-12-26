'use client';
import axios from 'redaxios';

const APi = axios.create({});

export const request = axios.create({
    baseURL: '/api',
});

export default APi;
