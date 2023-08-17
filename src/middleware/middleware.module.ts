import { Module } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { RepositoryModule } from 'src/repository/repository.module';

@Module({
    imports: [RepositoryModule],
    providers: [AuthService],
})
export class MiddlewareModule {}
