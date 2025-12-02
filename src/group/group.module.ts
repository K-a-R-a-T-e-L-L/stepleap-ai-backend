import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './services/group.service'
import { ChatModule } from '../chat/chat.module'

@Module({
    imports: [forwardRef(() => ChatModule)],
    providers: [GroupService],
    exports: [GroupService]
})
export class GroupModule {}
