import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.postsService.findAll(page, limit);
  }

  @Get('search')
  searchPosts(@Query('keyword') keyword: string) {
    return this.postsService.search(keyword);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  findMyPosts(@Req() req) {
    return this.postsService.findMyPosts(req.user.id);
  }

  @Get('liked')
  @UseGuards(AuthGuard('jwt'))
  findLikedPosts(@Req() req) {
    return this.postsService.findLikedPosts(req.user.id);
  }

  @Get('popular')
  findPopular() {
    return this.postsService.findPopular();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.postsService.remove(id, req.user);
  }

  @Patch(':id/like')
  @UseGuards(AuthGuard('jwt'))
  toggleLike(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.postsService.toggleLike(id, req.user.id);
  }
}
