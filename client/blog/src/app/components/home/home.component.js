import {homeController} from './home.controller'

export const homeComponent = 'homeComponent'
export const homeComponentOptions = {
  templateUrl: 'blog/src/app/components/home/home.html',
  controller: ['$localStorage', homeController],
  controllerAs: 'ctrl'
}
