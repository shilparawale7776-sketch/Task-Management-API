
package com.ikaansh.taskmanager.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ikaansh.taskmanager.entity.Task;
import com.ikaansh.taskmanager.entity.User;
import com.ikaansh.taskmanager.repository.TaskRepository;
import com.ikaansh.taskmanager.repository.UserRepository;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // Add Task
    @PostMapping
    public ResponseEntity<?> addTask(@RequestBody Map<String, Object> data) {

        String username = (String) data.get("username");

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
        }

        Task task = new Task();
        task.setTitle((String) data.get("title"));
        task.setDescription((String) data.get("description"));

        if (data.get("dueDate") != null) {
            task.setDueDate(
                java.time.LocalDate.parse(data.get("dueDate").toString())
            );
        }

        task.setCompleted(
            data.get("completed") == null
                ? false
                : Boolean.valueOf(data.get("completed").toString())
        );

        task.setUser(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskRepository.save(task));
    }

    // Get user's tasks
    @GetMapping
    public List<Task> getAllTasks(@RequestParam String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return taskRepository.findByUser_Id(user.getId());
    }

    // Update user's task
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestBody Task updatedTask) {

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
        }

        return taskRepository.findByIdAndUser_Id(id, user.getId())
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setDueDate(updatedTask.getDueDate());
                    task.setCompleted(updatedTask.getCompleted());

                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete user's task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @RequestParam String username) {

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
        }

        return taskRepository.findByIdAndUser_Id(id, user.getId())
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
