package org.example.packingisoservice.Controller;


import lombok.RequiredArgsConstructor;
import org.example.packingisoservice.DTO.IsoFieldsRequest;
import org.example.packingisoservice.DTO.PackingISOResponse;
import org.example.packingisoservice.Service.PackingISOService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/packing-iso")
@RequiredArgsConstructor
public class PackingISOController {

    private final PackingISOService packingISOService;

    @PostMapping("/pack-ascii")
    public PackingISOResponse packAscii(@RequestBody IsoFieldsRequest request) {
        return packingISOService.packAscii(request);
    }

    @PostMapping("/pack-hex")
    public PackingISOResponse packHex(@RequestBody IsoFieldsRequest request) {
        return packingISOService.packHex(request);
    }


}
