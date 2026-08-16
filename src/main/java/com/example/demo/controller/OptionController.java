package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Option;
import com.example.demo.repository.OptionRepository;

@RestController
@RequestMapping("/options")
public class OptionController {

    private OptionRepository optionRepository;

    public OptionController(OptionRepository optionRepository) {
        this.optionRepository = optionRepository;
    }

    @GetMapping
    public List<Option> getAllOptions() {
        return optionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Option getOptionById(@PathVariable Long id) {
        return optionRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Option createOption(@RequestBody Option option) {
        return optionRepository.save(option);
    }

    @PutMapping("/{id}")
    public Option updateOption(@PathVariable Long id, @RequestBody Option option) {
        option.setId(id);
        return optionRepository.save(option);
    }

    @DeleteMapping("/{id}")
    public String deleteOption(@PathVariable Long id) {
        optionRepository.deleteById(id);
        return "Option deleted successfully";
    }
}