import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Register} from './core/features/game/register/register';
import {AuthGuard} from './core/guards/auth-guard';
import {Startpage} from './core/features/game/startpage/startpage';
import {Basegameinterface} from './core/features/game/basegameinterface/basegameinterface';
import {NoAuthGuard} from './core/guards/noauth-guard';
import {Playinterface} from './core/features/game/basegameinterface/playinterface/playinterface';
import {Fightinterface} from './core/features/game/basegameinterface/fightinterface/fightinterface';

const routes: Routes = [
  { path: '',
    component: Startpage,
    canActivate: [AuthGuard],
    children: [
      { path: 'register', component: Register },
    ]
  },
  { path: '',
    component: Basegameinterface,
    canActivate: [NoAuthGuard],
    children: [
      { path: 'game', component: Playinterface },
      { path: 'fight', component: Fightinterface },
    ]
  },
  { path: '**', redirectTo: 'Startpage' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
