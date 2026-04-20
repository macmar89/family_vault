import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export const PaginationParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQueryDto => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const paginationDto = new PaginationQueryDto();
    paginationDto.page = query.page ? parseInt(query.page, 10) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit, 10) : 10;
    paginationDto.search = query.search || undefined;
    paginationDto.sortBy = query.sortBy || undefined;
    paginationDto.order = query.order === 'desc' ? 'desc' : 'asc';

    return paginationDto;
  },
);
