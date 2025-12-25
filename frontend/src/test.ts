
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

import './app/core/auth.service.spec';
import './app/features/home/home.component.spec';
import './app/features/jobs/jobs-list.component.spec';
import './app/features/jobs/job-detail.component.spec';

