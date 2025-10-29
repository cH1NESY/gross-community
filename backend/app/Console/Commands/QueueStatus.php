<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\DB;

class QueueStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'queue:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Проверка статуса очередей RabbitMQ';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $connection = config('queue.default');
            $this->info("🔍 Используемое соединение: {$connection}");
            
            if ($connection === 'rabbitmq') {
                $this->info("✅ RabbitMQ настроен как основное соединение");
                
                // Пытаемся получить размер очереди
                try {
                    $size = Queue::size();
                    $this->info("📊 Размер очереди: {$size} задач");
                } catch (\Exception $e) {
                    $this->warn("⚠️  Не удалось получить размер очереди: " . $e->getMessage());
                }
                
                // Проверяем таблицу failed_jobs
                try {
                    $failedJobs = DB::table('failed_jobs')->count();
                    if ($failedJobs > 0) {
                        $this->warn("⚠️  Найдено {$failedJobs} неудачных задач");
                    } else {
                        $this->info("✅ Нет неудачных задач");
                    }
                } catch (\Exception $e) {
                    $this->warn("⚠️  Таблица failed_jobs не найдена. Запустите: php artisan queue:failed-table");
                }
                
                // Проверяем таблицу jobs
                try {
                    $pendingJobs = DB::table('jobs')->count();
                    if ($pendingJobs > 0) {
                        $this->info("📋 Ожидающих задач в БД: {$pendingJobs}");
                    } else {
                        $this->info("✅ Нет ожидающих задач в БД");
                    }
                } catch (\Exception $e) {
                    // Таблица jobs может отсутствовать при использовании RabbitMQ
                    $this->info("ℹ️  Таблица jobs не используется (RabbitMQ хранит задачи в памяти)");
                }
                
            } else {
                $this->warn("⚠️  Используется другое соединение: {$connection}");
                $this->info("💡 Установите QUEUE_CONNECTION=rabbitmq в .env");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Ошибка: " . $e->getMessage());
            return 1;
        }
    }
}