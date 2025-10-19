import {NgModule, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Register } from './core/features/game/register/register';
import { FormsModule } from '@angular/forms';
import { Startpage } from './core/features/game/startpage/startpage';
import { Basegameinterface } from './core/features/game/basegameinterface/basegameinterface';
import { Playinterface } from './core/features/game/basegameinterface/playinterface/playinterface';
import { Fightinterface } from './core/features/game/basegameinterface/fightinterface/fightinterface';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

@NgModule({
  declarations: [
    App,
    Register,
    Startpage,
    Basegameinterface,
    Playinterface,
    Fightinterface
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
    provideHttpClient(withFetch()),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [App]
})
export class AppModule { }
