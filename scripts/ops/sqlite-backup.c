#include <sqlite3.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
int main(int argc,char **argv){
 if(argc!=3)return 2;
 int fd=open(argv[2],O_WRONLY|O_CREAT|O_EXCL,0600);if(fd<0)return 3;close(fd);
 sqlite3 *src=0,*dst=0;sqlite3_backup *copy=0;int code=1;
 if(sqlite3_open_v2(argv[1],&src,SQLITE_OPEN_READONLY,0)!=SQLITE_OK)goto done;
 if(sqlite3_open(argv[2],&dst)!=SQLITE_OK)goto done;
 sqlite3_busy_timeout(src,5000);sqlite3_busy_timeout(dst,5000);
 copy=sqlite3_backup_init(dst,"main",src,"main");if(!copy)goto done;
 int rc=SQLITE_OK,retries=0;
 do{rc=sqlite3_backup_step(copy,128);if(rc==SQLITE_BUSY||rc==SQLITE_LOCKED){sqlite3_sleep(50);retries++;}}while(rc==SQLITE_OK||((rc==SQLITE_BUSY||rc==SQLITE_LOCKED)&&retries<100));
 code=rc==SQLITE_DONE?0:1;
 done:if(copy&&sqlite3_backup_finish(copy)!=SQLITE_OK)code=1;if(src)sqlite3_close(src);if(dst)sqlite3_close(dst);if(code){unlink(argv[2]);fputs("SQLite snapshot failed\n",stderr);}return code;
}
