// inspired by this tutorial from Xavier Nayrac : https://lkdjiin.github.io/blog/2013/10/16/les-algorithmes-genetiques-demystifies-imagerie/
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable  } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile';
import * as _ from 'lodash';
@Component({
  selector: 'app-img-genetics',
  templateUrl: './img-genetics.component.html',
  styleUrls: ['./img-genetics.component.css']
})

export class ImgGeneticsComponent implements OnInit, AfterViewInit {
  totalSquares = 400;
  imgWidth = 400;
  imgHeight = 400;
  squareMaxSize = 40;
  mutateFlag = false;
  rangeFlag = false;
  img: HTMLImageElement;

  @ViewChild('canvasOrigin') canvasOrigin;
  @ViewChild('canvasGenetic') canvasGenetic;

  canvasBuffer: HTMLCanvasElement;
  ctxBuffer: CanvasRenderingContext2D;
  ctxOrigin: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;

  generation: number;
  quality: number;
  solution: ISquare[];
  range: number;

  scheduler: Observable<number>;
  schedulerPlay: boolean;
  constructor() {
    this.quality = 0;
    this.range = 255;
    this.generation = 0;
    this.schedulerPlay = true;
    this.img = new Image();
    this.img.src = '../../assets/img/my-dev-is-not-crazy-i-had-it-tested.jpg';
    this.scheduler =  Observable.interval(1);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.ctxOrigin = this.canvasOrigin.nativeElement.getContext('2d');
    this.ctx = this.canvasGenetic.nativeElement.getContext('2d');
    this.canvasBuffer = document.createElement('canvas');
    this.canvasBuffer.width = this.imgWidth;
    this.canvasBuffer.height = this.imgHeight;
    this.ctxBuffer = this.canvasBuffer.getContext('2d');
    this.solution = this.makeIndividual();
    setTimeout(() => {
      this.ctxOrigin.drawImage(this.img, 0, 0);
    }, 0);
    this.scheduler
    .takeWhile(() => {
      return this.schedulerPlay;
    })
    .subscribe(() => {
        this.hillClimb();
    });
  }
  rangeMode() {
    this.rangeFlag = !this.rangeFlag;
  }
  play() {
    this.schedulerPlay = true;
    this.scheduler
    .takeWhile(() => {
      return this.schedulerPlay;
    })
    .subscribe(() => {
        this.hillClimb();
    });
  }
  pause() {
    this.schedulerPlay = false;
  }
  private makeIndividual(): ISquare[] {
    const individual: ISquare[] = [];
    for (let index = 0; index < this.totalSquares; index++) {
      const square: ISquare = {
        x: Math.floor(Math.random() * this.imgWidth),
        y: Math.floor(Math.random() * this.imgHeight),
        size: Math.floor(Math.random() * this.imgWidth),
        red: Math.floor(Math.random() * this.range),
        green: Math.floor(Math.random() * this.range),
        blue: Math.floor(Math.random() * this.range),
        alpha: Math.random()
      };
      individual.push(square);
    }
    return individual;
  }
  private renderIndividual(individual: any, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.imgWidth, this.imgHeight);
    for (let index = this.totalSquares - 1; index >= 0; index--) {
      ctx.globalAlpha = individual[index].alpha;
      const rgb = `rgb(
        ${individual[index].red},
        ${individual[index].green},
        ${individual[index].blue})`;
      ctx.fillStyle = rgb;
      ctx.fillRect(individual[index].x, individual[index].y,
        individual[index].size, individual[index].size);
    }
  }
  private getQuality(individual: ISquare[], render: boolean = true) {
    const pixelArrayOrigin = this.ctxOrigin.getImageData(0, 0, this.imgWidth, this.imgHeight).data;
    let score = 0;
    if (render) {
      this.renderIndividual(individual, this.ctxBuffer);
    }
    const pixelArrayCandidate = this.ctxBuffer.getImageData(0, 0, 400, 400).data;
    for (let i = pixelArrayOrigin.length - 1 ; i >= 0; i -= 4) {
      score += Math.abs(pixelArrayOrigin[i] - pixelArrayCandidate[i]);
      score += Math.abs(pixelArrayOrigin[i - 1] - pixelArrayCandidate[i - 1]);
      score += Math.abs(pixelArrayOrigin[i - 2] - pixelArrayCandidate[i - 2]);
    }
    return score / 100000;
  }
  private hillClimb() {
    const opponent = this.mutate(_.clone(this.solution));
    this.mutateFlag = !this.mutateFlag;
    const score_opponent = this.getQuality(opponent);
    const score_solution = this.quality;
    if (score_opponent > this.quality) {
      this.solution = _.clone(opponent);
      this.renderIndividual(this.solution, this.ctx);
      this.quality = score_opponent;
    }
    this.generation++;
    if (this.generation % 100 === 0 && this.rangeFlag) {
      this.range = Math.random() * this.range;
    }
  }

  private mutate(individual: ISquare[]) {
    const gene = Math.floor(Math.random() * this.totalSquares);
    const squareProperty = Math.floor(Math.random() * 7);
    switch (squareProperty) {
      case 0:
        individual[gene].x = Math.floor(Math.random() * this.imgWidth);
        break;
      case 1:
        individual[gene].y = Math.floor(Math.random() * this.imgHeight);
        break;
      case 2:
        individual[gene].size = Math.floor(Math.random() * this.squareMaxSize);
        break;
      case 3:
        individual[gene].red = Math.floor(Math.random() * this.range);
        break;
      case 4:
        individual[gene].green = Math.floor(Math.random() * this.range);
        break;
      case 5:
        individual[gene].blue = Math.floor(Math.random() * this.range);
        break;
      case 6:
        individual[gene].alpha = Math.random();
        break;
    }
    return individual;
  }
}
export interface ISquare {
  x: number;
  y: number;
  size: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
}
